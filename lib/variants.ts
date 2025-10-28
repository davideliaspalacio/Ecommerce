export interface ProductVariant {
  id: string;
  variant_name: string;
  variant_type: string;
  variant_value: string;
  stock: number;
  availableStock?: number;
}

export interface ProductWithVariants {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  variants?: ProductVariant[];
}

export interface StockInfo {
  hasVariants: boolean;
  totalStock: number;
  variants: Array<{
    id: string;
    name: string;
    stock: number;
    availableStock: number;
  }>;
}


export function hasVariants(product: ProductWithVariants): boolean {
  return !!(product.variants && product.variants.length > 0);
}

export function getTotalStock(product: ProductWithVariants): number {
  if (hasVariants(product)) {
    return product.variants!.reduce((total, variant) => total + variant.stock, 0);
  }
  return product.stock_quantity || 0;
}

export function getVariantStock(product: ProductWithVariants, variantId: string): number {
  if (!hasVariants(product)) return 0;
  
  const variant = product.variants!.find(v => v.id === variantId);
  return variant ? variant.stock : 0;
}


export function getVariantAvailableStock(product: ProductWithVariants, variantId: string): number {
  if (!hasVariants(product)) return product.stock_quantity || 0;
  
  const variant = product.variants!.find(v => v.id === variantId);
  return variant ? (variant.availableStock || variant.stock) : 0;
}


export function createOrderItem(
  product: ProductWithVariants, 
  selectedVariant: ProductVariant | null, 
  quantity: number
) {
  const item = {
    product_id: product.id,
    quantity,
    price: product.price
  };

  if (hasVariants(product) && selectedVariant) {
    return {
      ...item,
      variant_id: selectedVariant.id
    };
  }

  return item;
}


export function canAddToCart(
  product: ProductWithVariants, 
  selectedVariant: ProductVariant | null, 
  quantity: number
): { canAdd: boolean; reason?: string } {
  if (hasVariants(product)) {
    if (!selectedVariant) {
      return { canAdd: false, reason: 'Debes seleccionar una variante' };
    }
    
    const availableStock = getVariantAvailableStock(product, selectedVariant.id);
    if (availableStock < quantity) {
      return { canAdd: false, reason: `Solo hay ${availableStock} unidades disponibles` };
    }
  } else {
    const availableStock = product.stock_quantity || 0;
    if (availableStock < quantity) {
      return { canAdd: false, reason: `Solo hay ${availableStock} unidades disponibles` };
    }
  }

  return { canAdd: true };
}


export function getAvailableVariants(product: ProductWithVariants): ProductVariant[] {
  if (!hasVariants(product)) return [];
  
  return product.variants!.filter(variant => 
    (variant.availableStock || variant.stock) > 0
  );
}

export function formatVariantName(variant: ProductVariant): string {
  return `${variant.variant_name} (${variant.variant_value})`;
}


export function getTotalAvailableStock(stockInfo: StockInfo): number {
  if (!stockInfo.hasVariants) {
    return stockInfo.totalStock;
  }
  
  return stockInfo.variants.reduce((total, variant) => total + variant.availableStock, 0);
}