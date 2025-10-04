export interface ProductType {
    id: string;
    name: string;
    price: number;
    image: string;
    image_back?: string;
    category: 'CAMISETA' | 'SUDADERA' | 'TOP' | 'JEAN' | 'JOGGER' | 'GORRA' | 'ACCESORIO';
    gender: 'HOMBRE' | 'MUJER' | 'UNISEX';
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
    image: string;
    image_back?: string;
    category: 'CAMISETA' | 'SUDADERA' | 'TOP' | 'JEAN' | 'JOGGER' | 'GORRA' | 'ACCESORIO';
    gender: 'HOMBRE' | 'MUJER' | 'UNISEX';
    description?: string;
    specifications?: string[];
    sizes?: string[];
    status?: 'active' | 'inactive' | 'draft' | 'out_of_stock';
    sku?: string;
    weight?: number;
    dimensions?: {
      width: number;
      height: number;
      depth: number;
    };
    tags?: string[];
  }

// Tipo para filtros de productos
export interface ProductFilters {
    category?: string;
    gender?: string;
    status?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
  }