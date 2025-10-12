import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    
    if (!orderId) {
      return NextResponse.json(
        { error: "ID de orden requerido" },
        { status: 400 }
      );
    }

    // Obtener la orden actual
    const { data: order, error: orderError } = await supabase
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

    // Verificar que la orden esté en un estado válido para completar
    const validStatuses = ['delivered', 'shipped', 'in_transit'];
    if (!validStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: `No se puede completar una orden con estado: ${order.status}` },
        { status: 400 }
      );
    }

    // Actualizar el estado a 'completed'
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating order:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar la orden" },
        { status: 500 }
      );
    }

    // Crear entrada en el historial de estados
    const { error: historyError } = await supabase
      .from("order_status_history")
      .insert({
        order_id: orderId,
        status: 'completed',
        notes: 'Orden completada por el cliente',
        created_by: order.user_id
      });

    if (historyError) {
      console.error("Error creating status history:", historyError);
      // No fallar la operación por esto, solo logear
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Orden completada exitosamente"
    });

  } catch (error) {
    console.error("Error completing order:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
