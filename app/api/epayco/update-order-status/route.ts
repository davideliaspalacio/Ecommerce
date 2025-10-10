import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar service role key para operaciones de backend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, payment_status, order_status, epayco_data } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: 'Se requiere order_id' },
        { status: 400 }
      );
    }

    // Actualizar la orden
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status: order_status,
        payment_status: payment_status,
        epayco_transaction_id: epayco_data?.x_transaction_id,
        epayco_ref_payco: epayco_data?.x_ref_payco || epayco_data?.ref_payco,
        epayco_response: epayco_data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando orden:', error);
      return NextResponse.json(
        { error: 'Error al actualizar la orden', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
      payment_status,
      order_status,
    });
  } catch (error: any) {
    console.error('Error en update-order-status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

