import { ProductType } from "./Product"

export interface CartItemType {
    product: ProductType
    size: string
    quantity: number
  }