import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar service role key para operaciones de backend (bypassa RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Este endpoint es llamado por ePayco cuando se confirma un pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Confirmación de ePayco recibida:', body);

    const {
      x_ref_payco,
      x_transaction_id,
      x_approval_code,
      x_response,
      x_response_reason_text,
      x_amount,
      x_currency_code,
      x_transaction_date,
      x_bank_name,
      x_cardnumber,
      x_franchise,
      x_customer_doctype,
      x_customer_document,
      x_customer_name,
      x_customer_lastname,
      x_customer_email,
      x_customer_phone,
      x_extra1, // Este será el order_id
    } = body;

    // x_response puede ser:
    // Aceptada: 'Aceptada'
    // Rechazada: 'Rechazada'
    // Pendiente: 'Pendiente'
    // Fallida: 'Fallida'

    const isApproved = x_response === 'Aceptada';
    const isPending = x_response === 'Pendiente';
    const isFailed = x_response === 'Rechazada' || x_response === 'Fallida';

    let paymentStatus: 'approved' | 'pending' | 'rejected' | 'cancelled' = 'pending';
    let orderStatus: 'pending' | 'completed' | 'failed' | 'cancelled' = 'pending';

    if (isApproved) {
      paymentStatus = 'approved';
      orderStatus = 'completed';
    } else if (isPending) {
      paymentStatus = 'pending';
      orderStatus = 'pending';
    } else if (isFailed) {
      paymentStatus = 'rejected';
      orderStatus = 'failed';
    }

    // Actualizar la orden en la base de datos
    if (x_extra1) {
      const { data: order, error } = await supabase
        .from('orders')
        .update({
          status: orderStatus,
          payment_status: paymentStatus,
          epayco_transaction_id: x_transaction_id,
          epayco_ref_payco: x_ref_payco,
          epayco_response: body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', x_extra1)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando orden:', error);
        return NextResponse.json(
          { error: 'Error al actualizar la orden' },
          { status: 500 }
        );
      }

      console.log('Orden actualizada:', order);
    }

    return NextResponse.json({
      success: true,
      message: 'Confirmación procesada correctamente',
    });
  } catch (error: any) {
    console.error('Error en confirmación:', error);
    return NextResponse.json(
      { error: 'Error procesando confirmación', details: error.message },
      { status: 500 }
    );
  }
}

// Para pruebas con GET
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ref_payco = searchParams.get('ref_payco');

  return NextResponse.json({
    message: 'Webhook de confirmación de ePayco',
    ref_payco,
    timestamp: new Date().toISOString(),
  });
}

