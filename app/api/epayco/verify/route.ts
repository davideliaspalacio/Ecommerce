import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar service role key para operaciones de backend (bypassa RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verificar el estado de un pago con ePayco
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('order_id');
    const refPayco = searchParams.get('ref_payco');

    if (!orderId && !refPayco) {
      return NextResponse.json(
        { error: 'Se requiere order_id o ref_payco' },
        { status: 400 }
      );
    }

    let query = supabase.from('orders').select('*');

    if (orderId) {
      query = query.eq('id', orderId);
    } else if (refPayco) {
      query = query.eq('epayco_ref_payco', refPayco);
    }

    const { data: order, error } = await query.single();

    if (error) {
      console.error('Error buscando orden:', error);
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Opcionalmente, aquí podrías consultar directamente a ePayco para verificar el estado
    // usando su API de consulta de transacciones

    return NextResponse.json({
      success: true,
      order,
      payment_status: order.payment_status,
      order_status: order.status,
    });
  } catch (error: any) {
    console.error('Error verificando pago:', error);
    return NextResponse.json(
      { error: 'Error verificando pago', details: error.message },
      { status: 500 }
    );
  }
}

