import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar service role key para operaciones de backend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Consultar directamente a ePayco el estado de una transacción
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const refPayco = searchParams.get('ref_payco');
    const orderId = searchParams.get('order_id');

    if (!refPayco && !orderId) {
      return NextResponse.json(
        { error: 'Se requiere ref_payco o order_id' },
        { status: 400 }
      );
    }

    // Si tenemos refPayco, consultar el estado del pago a ePayco
    if (refPayco) {
      // Usar la API correcta de ePayco con autenticación
      const epaycoUrl = `https://api.secure.payco.co/validation/v1/reference/${refPayco}`;
      
      // Crear credenciales de autenticación (Basic Auth)
      const publicKey = process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY;
      const privateKey = process.env.EPAYCO_PRIVATE_KEY;
      const authString = Buffer.from(`${publicKey}:${privateKey}`).toString('base64');
      
      const response = await fetch(epaycoUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error consultando ePayco:', errorText);
        throw new Error('Error consultando ePayco');
      }

      const paymentData = await response.json();
      console.log('Respuesta de ePayco:', paymentData);
      
      // Actualizar la orden con la información de ePayco
      if (paymentData.success && paymentData.data) {
        const data = paymentData.data;
        
        // Determinar el estado basado en la respuesta de ePayco
        // Los códigos de respuesta de ePayco:
        // 1 = Aceptada
        // 2 = Rechazada
        // 3 = Pendiente
        // 4 = Fallida
        let paymentStatus: 'approved' | 'pending' | 'rejected' | 'cancelled' = 'pending';
        let orderStatus: 'pending' | 'completed' | 'failed' | 'cancelled' = 'pending';

        const codResponse = parseInt(data.x_cod_response || data.x_cod_transaction_state || '0');
        const response = data.x_response || data.x_transaction_state;

        console.log('Código de respuesta:', codResponse, 'Estado:', response);

        if (codResponse === 1 || response === 'Aceptada' || response === 'Aprobada') {
          paymentStatus = 'approved';
          orderStatus = 'completed';
        } else if (codResponse === 2 || response === 'Rechazada') {
          paymentStatus = 'rejected';
          orderStatus = 'failed';
        } else if (codResponse === 4 || response === 'Fallida') {
          paymentStatus = 'rejected';
          orderStatus = 'failed';
        } else if (codResponse === 3 || response === 'Pendiente') {
          paymentStatus = 'pending';
          orderStatus = 'pending';
        }

        // Buscar la orden por ref_payco o por extra1 (order_id)
        const { data: order, error: findError } = await supabase
          .from('orders')
          .select('*')
          .or(`epayco_ref_payco.eq.${refPayco},id.eq.${data.x_extra1}`)
          .single();

        if (!findError && order) {
          // Actualizar la orden
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              status: orderStatus,
              payment_status: paymentStatus,
              epayco_transaction_id: data.x_transaction_id,
              epayco_ref_payco: data.x_ref_payco,
              epayco_response: paymentData.data,
              updated_at: new Date().toISOString(),
            })
            .eq('id', order.id);

          if (updateError) {
            console.error('Error actualizando orden:', updateError);
          }
        }

        return NextResponse.json({
          success: true,
          payment_status: paymentStatus,
          order_status: orderStatus,
          data: paymentData.data,
        });
      }
    }

    // Si solo tenemos orderId, consultar la orden
    if (orderId) {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Orden no encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        payment_status: order.payment_status,
        order_status: order.status,
        order,
      });
    }

    return NextResponse.json(
      { error: 'No se pudo verificar el pago' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error verificando pago:', error);
    return NextResponse.json(
      { error: 'Error al verificar el pago', details: error.message },
      { status: 500 }
    );
  }
}

