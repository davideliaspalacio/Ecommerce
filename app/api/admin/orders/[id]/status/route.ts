import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { new_status, notes } = body;
    
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

    if (!new_status) {
      return NextResponse.json(
        { error: "Nuevo estado requerido" },
        { status: 400 }
      );
    }

    // Estados válidos
    const validStatuses = [
      'pending', 'payment_approved', 'processing', 'ready_to_ship', 
      'shipped', 'in_transit', 'delivered', 'completed', 'failed', 
      'cancelled', 'returned'
    ];

    if (!validStatuses.includes(new_status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    // Obtener la orden actual
    const { data: order, error: orderError } = await supabaseWithAuth
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar el estado usando la función de la base de datos
    const { data: result, error: updateError } = await supabaseWithAuth.rpc('update_order_status', {
      p_order_id: orderId,
      p_new_status: new_status,
      p_notes: notes || null
    });

    if (updateError) {
      console.error("Error updating order status:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar el estado de la orden" },
        { status: 500 }
      );
    }

    // Obtener la orden actualizada
    const { data: updatedOrder, error: fetchError } = await supabaseWithAuth
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError) {
      console.error("Error fetching updated order:", fetchError);
      return NextResponse.json(
        { error: "Error al obtener la orden actualizada" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Estado actualizado a: ${new_status}`
    });

  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
