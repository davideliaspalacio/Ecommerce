import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Procesar pago con tarjeta de crédito usando la API de ePayco
 * POST /api/epayco/process-payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      order_id,
      card_data, // Datos de la tarjeta para tokenizar
      customer_data,
      dues, // Número de cuotas (1 para pago único)
    } = body;

    if (!order_id || !card_data) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Obtener la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Preparar credenciales de autenticación
    const publicKey = process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY;
    const privateKey = process.env.EPAYCO_PRIVATE_KEY;
    const pCustIdCliente = process.env.EPAYCO_P_CUST_ID_CLIENTE;
    const pKey = process.env.EPAYCO_P_KEY;
    
    console.log('Credenciales disponibles:');
    console.log('- Public Key:', publicKey ? 'OK (' + publicKey.substring(0, 10) + '...)' : 'MISSING');
    console.log('- Private Key:', privateKey ? 'OK' : 'MISSING');
    console.log('- P_CUST_ID_CLIENTE:', pCustIdCliente ? 'OK' : 'MISSING');
    console.log('- P_KEY:', pKey ? 'OK (' + (pKey.substring(0, 10) || '') + '...)' : 'MISSING');
    
    if (!publicKey || !privateKey) {
      console.error('Credenciales básicas de ePayco no configuradas');
      return NextResponse.json({
        success: false,
        error: 'Configuración de pago incorrecta',
        details: 'Credenciales de ePayco no encontradas',
      }, { status: 500 });
    }

    // Paso 1: Login para obtener token_apify
    const apiUrl = process.env.NEXT_PUBLIC_EPAYCO_API_URL || 'https://apify.epayco.co';
    const loginUrl = `${apiUrl}/login`;
    
    console.log('🔐 Iniciando login en:', loginUrl);
    
    // Crear Basic Auth (PUBLIC_KEY:PRIVATE_KEY en base64)
    const basicAuth = Buffer.from(`${publicKey}:${privateKey}`).toString('base64');
    console.log('✅ Basic Auth creado (primeros 20 chars):', basicAuth.substring(0, 20) + '...');
    
    // Headers para login
    const loginHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuth}`,
    };
    
    // NOTA: EntityClientId solo si es necesario para cliente registrador
    // Por ahora lo omitimos para usar las credenciales directas
    console.log('ℹ️  Usando credenciales directas (sin EntityClientId)');
    
    // Hacer login
    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: loginHeaders,
      body: JSON.stringify({
        public_key: publicKey,
        private_key: privateKey,
      }),
    });
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ Error en login:', errorText);
      console.error('Status:', loginResponse.status);
      
      return NextResponse.json({
        success: false,
        error: 'Error de autenticación con ePayco',
        details: 'No se pudo autenticar con el servicio de pagos',
        debug: process.env.NODE_ENV === 'development' ? errorText : undefined,
      }, { status: 500 });
    }
    
    const loginResult = await loginResponse.json();
    console.log('✅ Login exitoso:', JSON.stringify(loginResult, null, 2));
    
    // Extraer el token_apify
    const tokenApify = loginResult.token || loginResult.token_apify || loginResult.data?.token;
    
    if (!tokenApify) {
      console.error('❌ No se pudo obtener token_apify:', loginResult);
      return NextResponse.json({
        success: false,
        error: 'Error de autenticación',
        details: 'No se pudo obtener token de autenticación',
        debug: process.env.NODE_ENV === 'development' ? loginResult : undefined,
      }, { status: 500 });
    }
    
    console.log('✅ Token Apify obtenido (primeros 20 chars):', tokenApify.substring(0, 20) + '...');
    
    // Paso 2: Procesar el pago con el token_apify
    const paymentUrl = `${apiUrl}/payment/process`;
    console.log('🔄 Procesando pago en:', paymentUrl);

    // Asegurar formato de año (debe ser YYYY de 4 dígitos)
    let cardExpYear = card_data.card_exp_year;
    if (cardExpYear.length === 2) {
      cardExpYear = '20' + cardExpYear; // Convertir 25 a 2025
    }
    
    const paymentData = {
      // Información del pago
      value: order.total.toString(),
      
      // Información del cliente
      docType: (customer_data?.doc_type || 'CC').toUpperCase(),
      docNumber: customer_data?.doc_number || '',
      name: customer_data?.name || '',
      lastName: customer_data?.last_name || '',
      email: customer_data?.email || order.user_email,
      cellPhone: customer_data?.cell_phone || customer_data?.phone || '',
      phone: customer_data?.phone || '',
      address: order.shipping_address || 'N/A',
      
      // Datos de la tarjeta (primera transacción)
      cardNumber: card_data.card_number,
      cardExpYear: cardExpYear,
      cardExpMonth: card_data.card_exp_month,
      cardCvc: card_data.card_cvc,
      dues: dues || '1',
      
      // Opcionales
      currency: 'COP',
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          '127.0.0.1',
      urlResponse: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?order_id=${order.id}`,
      urlConfirmation: `${process.env.NEXT_PUBLIC_APP_URL}/api/epayco/confirm`,
      methodConfirmation: 'POST',
      testMode: process.env.NODE_ENV === 'development',
      country: 'CO',
      
      // Extras para tracking
      extra1: order.id,
      extra2: order.user_id,
      extra3: 'direct_payment',
    };

    console.log('📤 Datos del pago:', {
      order_id,
      customer: paymentData.email,
      value: paymentData.value,
      cardNumber: card_data.card_number.substring(0, 6) + '...',
    });

    // Hacer la solicitud a ePayco con Bearer token (token_apify)
    const response = await fetch(paymentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenApify}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en respuesta de ePayco:', errorText);
      throw new Error(`Error procesando pago: ${response.status}`);
    }

    const paymentResult = await response.json();
    console.log('✅ Respuesta completa de ePayco:', JSON.stringify(paymentResult, null, 2));

    // Validar la respuesta (formato de apify)
    if (!paymentResult.success || paymentResult.success === false) {
      console.error('❌ Pago rechazado:', paymentResult);
      
      // Actualizar orden como fallida
      await supabase
        .from('orders')
        .update({
          payment_status: 'rejected',
          status: 'failed',
          epayco_response: paymentResult,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      return NextResponse.json({
        success: false,
        error: paymentResult.titleResponse || 'Error procesando el pago',
        message: paymentResult.textResponse || 'El pago fue rechazado',
        debug: process.env.NODE_ENV === 'development' ? paymentResult : undefined,
      }, { status: 400 });
    }

    // Pago exitoso - extraer datos de la transacción
    const transaction = paymentResult.data?.transaction?.data || {};
    const tokenCard = paymentResult.data?.tokenCard || {};
    
    // Determinar el estado basado en la respuesta
    let paymentStatus: 'approved' | 'pending' | 'rejected' | 'cancelled' = 'pending';
    let orderStatus: 'pending' | 'completed' | 'failed' | 'cancelled' = 'pending';

    const estado = transaction.estado || transaction.respuesta;
    
    console.log('📊 Estado recibido:', estado);
    
    if (estado && (estado.toLowerCase().includes('aceptada') || estado.toLowerCase().includes('aprobada') || estado.toLowerCase().includes('approved'))) {
      paymentStatus = 'approved';
      orderStatus = 'completed';
    } else if (estado && (estado.toLowerCase().includes('rechazada') || estado.toLowerCase().includes('rejected'))) {
      paymentStatus = 'rejected';
      orderStatus = 'failed';
    } else if (estado && (estado.toLowerCase().includes('fallida') || estado.toLowerCase().includes('failed'))) {
      paymentStatus = 'rejected';
      orderStatus = 'failed';
    } else if (estado && (estado.toLowerCase().includes('pendiente') || estado.toLowerCase().includes('pending'))) {
      paymentStatus = 'pending';
      orderStatus = 'pending';
    }

    // Actualizar la orden con la información de ePayco
    const refPayco = transaction.ref_payco || transaction.recibo;
    const transactionId = transaction.recibo || transaction.ref_payco;
    
    console.log('📝 Actualizando orden:', {
      payment_status: paymentStatus,
      status: orderStatus,
      ref_payco: refPayco,
      transaction_id: transactionId,
    });
    
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        epayco_transaction_id: transactionId,
        epayco_ref_payco: refPayco,
        epayco_response: paymentResult,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('❌ Error actualizando orden:', updateError);
    } else {
      console.log('✅ Orden actualizada exitosamente');
    }

    return NextResponse.json({
      success: true,
      payment_status: paymentStatus,
      order_status: orderStatus,
      data: {
        ref_payco: refPayco,
        transaction_id: transactionId,
        authorization: transaction.autorizacion,
        estado: transaction.estado,
        respuesta: transaction.respuesta,
        order_id: order.id,
        // Incluir tokens para futuras transacciones
        cardTokenId: tokenCard.cardTokenId,
        customerId: tokenCard.customerId,
      },
    });
  } catch (error: any) {
    console.error('💥 Error procesando pago:', error);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al procesar el pago', 
        details: error.message,
        debug: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

