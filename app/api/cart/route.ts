import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { CartItemType, AddToCartRequest } from '@/components/types/CartItem';
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

// GET - Obtener items del carrito del usuario
export async function GET(request: NextRequest) {
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

    // Crear cliente de Supabase con token de usuario para RLS
    const userSupabase = createUserSupabaseClient(token);

    // Obtener items del carrito con productos completos
    const { data: cartItems, error } = await userSupabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        size,
        quantity,
        created_at,
        updated_at,
        products (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cart items:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch cart items' }, { status: 500 });
    }

    // Transformar los datos con productos completos
    const transformedItems: CartItemType[] = cartItems?.map((item: any) => ({
      id: item.id,
      product: transformProduct(item.products), // Producto completo transformado
      size: item.size,
      quantity: item.quantity,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })) || [];

    return NextResponse.json({ success: true, data: transformedItems });
  } catch (error) {
    console.error('Error in GET /api/cart:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Agregar item al carrito
export async function POST(request: NextRequest) {
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

    const body: AddToCartRequest = await request.json();
    const { product_id, size, quantity = 1 } = body;

    if (!product_id || !size) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const userSupabase = createUserSupabaseClient(token);

    console.log('Adding to cart:', { product_id, size, quantity, user_id: user.id });

    // Verificar si el item ya existe
    const { data: existingItem, error: checkError } = await userSupabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .eq('size', size)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing item:', checkError);
      return NextResponse.json({ success: false, error: 'Failed to check existing item' }, { status: 500 });
    }

    if (existingItem) {
      // Actualizar cantidad existente
      const { data: updatedItem, error: updateError } = await userSupabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .eq('user_id', user.id)
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

      console.log('Updated existing cart item:', updatedItem);

      const transformedItem: CartItemType = {
        id: updatedItem.id,
        product: transformProduct(updatedItem.products),
        size: updatedItem.size,
        quantity: updatedItem.quantity,
        created_at: updatedItem.created_at,
        updated_at: updatedItem.updated_at,
      };

      return NextResponse.json({ success: true, data: transformedItem });
    } else {
      // Crear nuevo item
      const { data: newItem, error: insertError } = await userSupabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id,
          size,
          quantity,
        })
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

      if (insertError) {
        console.error('Error creating cart item:', insertError);
        return NextResponse.json({ success: false, error: 'Failed to create cart item', details: insertError.message }, { status: 500 });
      }

      console.log('Created new cart item:', newItem);

      const transformedItem: CartItemType = {
        id: newItem.id,
        product: transformProduct(newItem.products),
        size: newItem.size,
        quantity: newItem.quantity,
        created_at: newItem.created_at,
        updated_at: newItem.updated_at,
      };

      return NextResponse.json({ success: true, data: transformedItem });
    }
  } catch (error) {
    console.error('Error in POST /api/cart:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Limpiar carrito completo
export async function DELETE(request: NextRequest) {
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

    const userSupabase = createUserSupabaseClient(token);

    const { error } = await userSupabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing cart:', error);
      return NextResponse.json({ success: false, error: 'Failed to clear cart', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/cart:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
