import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { 
      tracking_number, 
      carrier, 
      carrier_service, 
      estimated_delivery, 
      notes 
    } = body;
    
    // Obtener el token de autorización del header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: "Token de autorización requerido" },
        { status: 401 }
      );
    }
    
    // Configurar Supabase con el token del usuario
    const token = authHeader.replace('Bearer ', '');
    const supabaseWithAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
    
    if (!orderId) {
      return NextResponse.json(
        { error: "ID de orden requerido" },
        { status: 400 }
      );
    }

    if (!tracking_number || !carrier) {
      return NextResponse.json(
        { error: "Número de seguimiento y transportadora son requeridos" },
        { status: 400 }
      );
    }

    // Obtener la orden para verificar que existe
    const { data: order, error: orderError } = await supabaseWithAuth
      .from("orders")
      .select("id, user_id")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Agregar información de envío usando la función de la base de datos
    const { data: result, error: shippingError } = await supabaseWithAuth.rpc('add_shipping_tracking', {
      p_order_id: orderId,
      p_tracking_number: tracking_number,
      p_carrier: carrier,
      p_estimated_delivery: estimated_delivery || null,
      p_notes: notes || null
    });

    if (shippingError) {
      console.error("Error adding shipping tracking:", shippingError);
      return NextResponse.json(
        { error: "Error al agregar información de envío" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Información de envío agregada correctamente",
      data: result
    });

  } catch (error) {
    console.error("Error adding shipping tracking:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
