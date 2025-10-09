import { ProductType } from "./Product";

export interface WishlistItemType {
  id: string;
  user_id: string;
  product_id: string;
  share_id?: string;
  is_public?: boolean;
  share_enabled?: boolean;
  purchase_enabled?: boolean;
  created_by_name?: string;
  created_by_email?: string;
  created_at: string;
  updated_at: string;
  product: ProductType;
}

export interface CreateWishlistItemType {
  product_id: string;
}

export interface WishlistWithProductType extends ProductType {
  wishlist_id: string;
  user_id: string;
  share_id?: string;
  is_public?: boolean;
  share_enabled?: boolean;
  purchase_enabled?: boolean;
  created_by_name?: string;
  created_by_email?: string;
  added_at: string;
  wishlist_updated_at: string;
}

export interface SharedWishlistType {
  wishlist_id: string;
  user_id: string;
  share_id: string;
  is_public: boolean;
  share_enabled: boolean;
  purchase_enabled: boolean;
  created_by_name: string;
  created_by_email: string;
  added_at: string;
  wishlist_updated_at: string;
  products: ProductType[];
}

export interface CreateSharedWishlistType {
  is_public?: boolean;
  share_enabled?: boolean;
  purchase_enabled?: boolean;
  created_by_name?: string;
  created_by_email?: string;
}
