import { ProductType } from "./Product"

export interface CartItemType {
    id?: string
    product: ProductType
    size?: string // ← OPCIONAL: Para compatibilidad con productos sin variantes
    quantity: number
    variant_id: string // ← REQUERIDO: ID de variante principal
    created_at?: string
    updated_at?: string
    // Campos de promoción del backend
    price?: number
    original_price?: number | null
    discount_percentage?: number | null
    is_on_discount?: boolean
    final_price?: number
}

export interface CartItemDB {
    id: string
    user_id: string
    product_id: string
    size: string
    quantity: number
    created_at: string
    updated_at: string
}

export interface AddToCartRequest {
    product_id: string
    size: string
    quantity?: number
}

export interface UpdateCartItemRequest {
    quantity: number
}

export interface CartResponse {
    success: boolean
    data?: CartItemType[]
    error?: string
    details?: string
}