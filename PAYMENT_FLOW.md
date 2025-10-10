# Flujo de Pago Directo con Tarjeta - ePayco

## Descripción

Este proyecto implementa un sistema de pago directo con tarjeta de crédito/débito usando la API de ePayco con tokenización. No usa el iframe/widget de ePayco, dando control total sobre el flujo de pago.

## Arquitectura

### Componentes Frontend

1. **`epaycoCheckout.tsx`** - Modal principal del checkout
   - Maneja el flujo de 2 pasos: Envío → Pago
   - Crea la orden antes de mostrar el formulario de pago
   - Procesa la respuesta del pago y redirige según el resultado

2. **`CreditCardForm.tsx`** - Formulario de tarjeta
   - Captura datos de la tarjeta
   - Usa `epayco.js` para tokenización segura
   - Valida campos antes de enviar
   - Nunca envía datos sensibles de tarjeta al servidor

### Endpoints Backend

1. **`/api/epayco/create-order`** - Crear orden
   - Crea la orden en la BD con estado `pending`
   - Calcula totales, impuestos y envío
   - Retorna el ID de la orden

2. **`/api/epayco/process-payment`** - Procesar pago
   - Recibe el token de la tarjeta (no datos sensibles)
   - Envía el pago a ePayco usando su API
   - Actualiza el estado de la orden según la respuesta
   - Retorna el resultado del pago

3. **`/api/epayco/confirm`** - Webhook de confirmación
   - Recibe confirmaciones asíncronas de ePayco
   - Actualiza el estado de la orden

4. **`/api/epayco/check-payment`** - Verificar estado
   - Consulta el estado actual de un pago
   - Útil para verificaciones manuales

## Flujo Completo

```
1. Usuario añade productos al carrito
   ↓
2. Click en "Proceder al pago"
   ↓
3. PASO 1: Formulario de envío
   - Usuario completa dirección y datos
   - Click en "Continuar al pago"
   ↓
4. Backend crea la orden (status: pending)
   ↓
5. PASO 2: Formulario de tarjeta
   - Usuario ingresa datos de la tarjeta
   - Click en "Pagar Ahora"
   ↓
6. Frontend tokeniza la tarjeta con epayco.js
   - Los datos de la tarjeta NUNCA van al servidor
   - Se genera un token seguro
   ↓
7. Frontend envía token al backend
   ↓
8. Backend procesa el pago con ePayco
   - POST a https://api.secure.payco.co/payment/v1/charge
   - Con el token de la tarjeta
   ↓
9. ePayco procesa el pago
   ↓
10. Backend actualiza la orden
    - approved → completed
    - rejected → failed
    - pending → pending
   ↓
11. Frontend maneja la respuesta:
    - APROBADO: Limpia carrito → Redirige a /payment-success
    - PENDIENTE: Muestra mensaje → Redirige a /my-orders
    - RECHAZADO: Muestra error → Permite reintentar
```

## Seguridad

### Tokenización con epayco.js

```javascript
// El formulario genera un token en el cliente
window.ePayco.token.create({
  "card[number]": cardNumber,
  "card[exp_year]": expYear,
  "card[exp_month]": expMonth,
  "card[cvc]": cvv,
}, (error, token) => {
  if (token) {
    // Solo el token va al servidor
    sendToServer({ token_card: token.id });
  }
});
```

**Ventajas**:
- Los datos de la tarjeta nunca pasan por tu servidor
- Cumplimiento PCI-DSS sin certificación compleja
- Mayor seguridad para el usuario

### Autenticación con ePayco

```javascript
// Basic Auth con public_key:private_key
const authString = Buffer.from(`${publicKey}:${privateKey}`).toString('base64');

fetch(paymentUrl, {
  headers: {
    'Authorization': `Basic ${authString}`,
  },
  // ...
});
```

## Estados de Pago

| Estado ePayco | payment_status | order_status | Acción |
|--------------|----------------|--------------|--------|
| Aceptada/Aprobada | approved | completed | Limpiar carrito, redirigir a éxito |
| Rechazada | rejected | failed | Mostrar error, permitir reintentar |
| Fallida | rejected | failed | Mostrar error, permitir reintentar |
| Pendiente | pending | pending | Mostrar mensaje, redirigir a órdenes |

## Configuración

### Variables de Entorno Requeridas

```env
# ePayco
NEXT_PUBLIC_EPAYCO_PUBLIC_KEY=tu_public_key
EPAYCO_PRIVATE_KEY=tu_private_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# App
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### Script de ePayco

El componente `CreditCardForm` carga automáticamente:
```html
<script src="https://checkout.epayco.co/checkout.js"></script>
```

Este script proporciona:
- `window.ePayco.token.create()` - Para tokenización
- `window.ePayco.checkout.configure()` - Para configuración

## API de ePayco - Endpoint de Pago

### Request

```http
POST https://api.secure.payco.co/payment/v1/charge
Authorization: Basic base64(public_key:private_key)
Content-Type: application/json

{
  "token_card": "token_generado_por_epayco_js",
  "customer_id": "user_id",
  "doc_type": "CC",
  "doc_number": "123456789",
  "name": "Juan",
  "last_name": "Perez",
  "email": "juan@example.com",
  "phone": "3001234567",
  "cell_phone": "3001234567",
  "bill": "order_id",
  "description": "Compra en Mattelsa",
  "value": "100000",
  "tax": "19000",
  "tax_base": "81000",
  "currency": "COP",
  "dues": "1",
  "ip": "192.168.1.1",
  "url_response": "https://tu-app.com/payment-success",
  "url_confirmation": "https://tu-app.com/api/epayco/confirm",
  "method_confirmation": "POST",
  "extra1": "order_id",
  "extra2": "user_id",
  "extra3": "direct_payment"
}
```

### Response (Éxito)

```json
{
  "success": true,
  "data": {
    "id": "123456",
    "ref_payco": "987654321",
    "estado": "Aceptada",
    "x_response": "Aceptada",
    "x_approval_code": "ABC123",
    "x_transaction_id": "123456",
    "x_response_reason_text": "APROBADA",
    "x_cod_response": "1"
  }
}
```

### Response (Rechazo)

```json
{
  "success": false,
  "data": {
    "errors": ["TARJETA INVALIDA"],
    "description": "La tarjeta fue rechazada",
    "estado": "Rechazada"
  }
}
```

## Testing

### Modo de Pruebas

El sistema detecta automáticamente el modo:

```javascript
test: process.env.NODE_ENV === "development"
```

### Tarjetas de Prueba ePayco

**Tarjeta Aprobada:**
- Número: `4575623182290326`
- CVV: `123`
- Fecha: Cualquier fecha futura

**Tarjeta Rechazada:**
- Número: `4151611524583851`
- CVV: `123`
- Fecha: Cualquier fecha futura

**Tarjeta Pendiente:**
- Número: `4509420259014796`
- CVV: `123`
- Fecha: Cualquier fecha futura

## Manejo de Errores

### Errores en Frontend

```typescript
// Error al tokenizar
if (error) {
  setError(error.data?.description || "Error al procesar la tarjeta");
  return;
}

// Error en validación
if (cardNumberClean.length < 15) {
  setError("Número de tarjeta inválido");
  return;
}
```

### Errores en Backend

```typescript
// Error en la API de ePayco
if (!response.ok) {
  const errorText = await response.text();
  console.error('Error en respuesta de ePayco:', errorText);
  throw new Error(`Error procesando pago: ${response.status}`);
}

// Pago rechazado
if (!paymentResult.success) {
  await supabase
    .from('orders')
    .update({
      payment_status: 'rejected',
      status: 'failed',
      epayco_response: paymentResult,
    })
    .eq('id', order.id);
    
  return NextResponse.json({
    success: false,
    error: paymentResult.data?.errors || 'Error procesando el pago',
  }, { status: 400 });
}
```

## Ventajas vs Widget de ePayco

### Con Widget (Anterior)
❌ Sin acceso a detalles de la transacción en tiempo real  
❌ Menos control sobre el flujo UX  
❌ Depende de redirecciones  
❌ Difícil de personalizar  

### Con API Directa (Actual)
✅ Control total del flujo de pago  
✅ Acceso inmediato a resultados de transacción  
✅ UX personalizada y consistente  
✅ Manejo de errores más preciso  
✅ Validación en tiempo real  
✅ Mejor experiencia móvil  

## Debugging

### Logs Importantes

```javascript
// Frontend
console.log("Generando token de tarjeta...");
console.log("Token generado exitosamente:", token.id);

// Backend
console.log('Procesando pago con ePayco:', { order_id, customer });
console.log('Respuesta de ePayco:', paymentResult);
```

### Verificar Estado de Orden

```bash
# Consultar estado en Supabase
SELECT id, status, payment_status, epayco_ref_payco, epayco_response 
FROM orders 
WHERE id = 'order_id';

# O usar el endpoint
curl https://tu-app.com/api/epayco/check-payment?order_id=ORDER_ID
```

## Próximos Pasos

### Mejoras Sugeridas

1. **Agregar más métodos de pago**
   - PSE
   - Efectivo
   - Corresponsales bancarios

2. **Cuotas**
   - Permitir al usuario elegir número de cuotas
   - Mostrar intereses

3. **Guardar tarjetas**
   - Usar el sistema de clientes de ePayco
   - Mostrar últimos 4 dígitos

4. **Reintentos automáticos**
   - Para pagos pendientes
   - Notificaciones por email

5. **Analytics**
   - Tasa de conversión
   - Motivos de rechazo más comunes
   - Tiempo promedio de pago

## Soporte

### Documentación Oficial ePayco
- [API Docs](https://docs.epayco.co/)
- [Tokenización](https://epayco.com/fonts/doc/tokenization/)
- [Payment Gateway](https://epayco.com/fonts/doc/API/)

### Troubleshooting Común

**Problema**: "Error al generar token"
- Verificar que epayco.js esté cargado
- Verificar formato de número de tarjeta
- Verificar que la fecha no esté expirada

**Problema**: "Pago rechazado"
- Verificar saldo en tarjeta de prueba
- Verificar que el monto sea válido
- Revisar logs de ePayco para más detalles

**Problema**: "Orden no actualizada"
- Verificar webhook de confirmación
- Verificar permisos de Supabase (service role key)
- Consultar manualmente con check-payment

