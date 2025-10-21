export interface ProductType {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    discount_percentage?: number;
    is_on_discount?: boolean;
    discount_start_date?: string;
    discount_end_date?: string;
    current_price?: number;
    savings_amount?: number;
    discount_active?: boolean;
    images: string[];
    main_image: string;
    image?: string;
    image_back?: string;
    category: 'camiseta' | 'sudadera' | 'top' | 'jean' | 'jogger' | 'gorra' | 'accesorio';
    gender: 'hombre' | 'mujer' | 'unisex';
    description?: string;
    specifications: string[];
    sizes: string[];
    status: 'active' | 'inactive' | 'draft' | 'out_of_stock';
    stock_quantity: number;
    sku?: string;
    weight?: number;
    dimensions?: {
      width: number;
      height: number;
      depth: number;
    };
    tags: string[];
    created_at: string;
    updated_at: string;
    created_by?: string;
    updated_by?: string;
  }

export interface CreateProductType {
    name: string;
    price: number;
    original_price?: number;
    discount_percentage?: number;
    is_on_discount?: boolean;
    discount_start_date?: string;
    discount_end_date?: string;
    images: string[];
    main_image: string;
    image?: string;
    image_back?: string;
    category: 'camiseta' | 'sudadera' | 'top' | 'jean' | 'jogger' | 'gorra' | 'accesorio';
    gender: 'hombre' | 'mujer' | 'unisex';
    description?: string;
    specifications?: string[];
    sizes?: string[];
    status?: 'active' | 'inactive' | 'draft' | 'out_of_stock';
    stock_quantity?: number;
    sku?: string;
    weight?: number;
    dimensions?: {
      width: number;
      height: number;
      depth: number;
    };
    tags?: string[];
  }

export interface ProductFilters {
    category?: string;
    gender?: string;
    status?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }

export const getCurrentPrice = (product: ProductType): number => {
  if (product.current_price !== undefined) {
    return product.current_price;
  }
  
  if (product.is_on_discount && product.original_price && product.discount_percentage) {
    return product.original_price * (1 - product.discount_percentage / 100);
  }
  
  return product.price;
};

export const getSavingsAmount = (product: ProductType): number => {
  if (product.savings_amount !== undefined) {
    return product.savings_amount;
  }
  
  if (product.is_on_discount && product.original_price) {
    return product.original_price - getCurrentPrice(product);
  }
  
  return 0;
};

export const isDiscountActive = (product: ProductType): boolean => {
  // Si discount_active está definido, usar ese valor (para casos especiales)
  if (product.discount_active !== undefined) {
    return product.discount_active;
  }
  
  // Con el trigger de la base de datos, is_on_discount ya maneja las fechas automáticamente
  // Solo necesitamos verificar que tenga los datos necesarios para mostrar el descuento
  return product.is_on_discount === true && 
         !!product.original_price && 
         !!product.discount_percentage;
};

export const getDiscountPercentage = (product: ProductType): number => {
  if (product.discount_percentage) {
    return product.discount_percentage;
  }
  
  if (product.is_on_discount && product.original_price) {
    const currentPrice = getCurrentPrice(product);
    return Math.round(((product.original_price - currentPrice) / product.original_price) * 100);
  }
  
  return 0;
};
export interface ProductImages {
  mainImage: string;
  gallery: string[];
  totalImages: number;
}

export interface ImageUploadResponse {
  image_urls: string[];
}

export interface UpdateImagesRequest {
  image_urls: string[];
}

export interface DeleteImageRequest {
  image_url: string;
}

export const mapProductImages = (product: ProductType): ProductImages => {
  if (product.images && product.images.length > 0) {
    return {
      mainImage: product.main_image || product.images[0],
      gallery: product.images,
      totalImages: product.images.length
    };
  }
  
  const legacyImages: string[] = [];
  if (product.image) legacyImages.push(product.image);
  if (product.image_back) legacyImages.push(product.image_back);
  
  return {
    mainImage: product.image || '',
    gallery: legacyImages,
    totalImages: legacyImages.length
  };
};

export const getMainImage = (product: ProductType): string => {
  return product.main_image || product.image || '';
};

export const getAllImages = (product: ProductType): string[] => {
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  
  const legacyImages: string[] = [];
  if (product.image) legacyImages.push(product.image);
  if (product.image_back) legacyImages.push(product.image_back);
  
  return legacyImages;
};