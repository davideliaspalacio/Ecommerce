import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { CartItemType, UpdateCartItemRequest } from '@/components/types/CartItem';
import { ProductType } from '@/components/types/Product';

// Función auxiliar para crear cliente de Supabase con token de usuario
const createUserSupabaseClient = (accessToken: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};

// Función auxiliar para transformar producto de la base de datos
const transformProduct = (dbProduct: any): ProductType => {
  // Calcular si el descuento está activo
  const now = new Date();
  const startDate = dbProduct.discount_start_date ? new Date(dbProduct.discount_start_date) : null;
  const endDate = dbProduct.discount_end_date ? new Date(dbProduct.discount_end_date) : null;
  
  const isDiscountActive = dbProduct.is_on_discount && 
    (!startDate || now >= startDate) && 
    (!endDate || now <= endDate);

  // Calcular precio final
  const finalPrice = isDiscountActive && dbProduct.original_price 
    ? dbProduct.original_price * (1 - (dbProduct.discount_percentage || 0) / 100)
    : dbProduct.price;

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    price: dbProduct.price,
    original_price: dbProduct.original_price,
    discount_percentage: dbProduct.discount_percentage,
    is_on_discount: isDiscountActive,
    discount_start_date: dbProduct.discount_start_date,
    discount_end_date: dbProduct.discount_end_date,
    current_price: finalPrice,
    savings_amount: isDiscountActive && dbProduct.original_price 
      ? dbProduct.original_price - finalPrice 
      : 0,
    discount_active: isDiscountActive,
    image: dbProduct.image,
    image_back: dbProduct.image_back,
    description: dbProduct.description,
    category: dbProduct.category,
    gender: dbProduct.gender,
    sizes: dbProduct.sizes || [],
    stock_quantity: dbProduct.stock_quantity || 0,
    status: dbProduct.status || 'active',
    specifications: dbProduct.specifications || [],
    tags: dbProduct.tags || [],
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
  };
};

// PUT - Actualizar cantidad de un item específico
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const { id } = params;
    const body: UpdateCartItemRequest = await request.json();
    const { quantity } = body;

    if (quantity === undefined || quantity < 1) {
      return NextResponse.json({ success: false, error: 'Invalid quantity' }, { status: 400 });
    }

    const userSupabase = createUserSupabaseClient(token);

    const { data: updatedItem, error: updateError } = await userSupabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .eq('user_id', user.id) // Asegurar que solo el dueño puede actualizar
      .select(`
        id,
        product_id,
        size,
        quantity,
        created_at,
        updated_at,
        products (*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating cart item:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update cart item', details: updateError.message }, { status: 500 });
    }

    const transformedItem: CartItemType = {
      id: updatedItem.id,
      product: transformProduct(updatedItem.products),
      size: updatedItem.size,
      quantity: updatedItem.quantity,
      created_at: updatedItem.created_at,
      updated_at: updatedItem.updated_at,
    };

    return NextResponse.json({ success: true, data: transformedItem });
  } catch (error) {
    console.error('Error in PUT /api/cart/[id]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Eliminar un item específico del carrito
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const { id } = params;
    const userSupabase = createUserSupabaseClient(token);

    const { error } = await userSupabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Asegurar que solo el dueño puede eliminar

    if (error) {
      console.error('Error deleting cart item:', error);
      return NextResponse.json({ success: false, error: 'Failed to delete cart item', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/cart/[id]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
