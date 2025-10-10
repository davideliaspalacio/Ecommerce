import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar service role key para operaciones de backend (bypassa RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      user_email, 
      user_name, 
      user_phone, 
      shipping_info,
      items, 
      subtotal, 
      tax,
      shipping_cost,
      total, 
      payment_method, 
      notes 
    } = body;

    // Validaciones básicas
    if (!user_id || !user_email || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    if (!shipping_info) {
      return NextResponse.json(
        { error: 'Falta información de envío' },
        { status: 400 }
      );
    }

    // Crear la orden en la base de datos
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id,
        user_email,
        user_name,
        user_phone,
        // Información de envío
        shipping_full_name: shipping_info.full_name,
        shipping_phone: shipping_info.phone,
        shipping_email: shipping_info.email,
        shipping_document_type: shipping_info.document_type,
        shipping_document_number: shipping_info.document_number,
        shipping_address: shipping_info.address,
        shipping_city: shipping_info.city,
        shipping_department: shipping_info.department,
        shipping_postal_code: shipping_info.postal_code,
        shipping_neighborhood: shipping_info.neighborhood,
        shipping_additional_info: shipping_info.additional_info,
        // Items y totales
        items,
        subtotal,
        tax,
        shipping_cost: shipping_cost || 0,
        total,
        status: 'pending',
        payment_method: payment_method || 'epayco',
        payment_status: 'pending',
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando orden:', error);
      return NextResponse.json(
        { error: 'Error al crear la orden', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Error en create-order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

