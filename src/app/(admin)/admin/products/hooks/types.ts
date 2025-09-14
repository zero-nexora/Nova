export interface ProductImage {
  id: string;
  image_url: string;
  public_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  public_id?: string | null;
}

export interface ProductSubcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  image_url?: string | null;
  public_id?: string | null;
}

export interface ProductAttribute {
  id: string;
  name: string;
  is_deleted: boolean;
}

export interface ProductAttributeValue {
  id: string;
  value: string;
  attribute_id: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  attribute: ProductAttribute;
}

// UPDATED: Đổi tên interface để khớp với form
export interface ProductVariantAttribute {
  id: string;
  product_variant_id: string;
  attribute_value_id: string;
  created_at: Date;
  updated_at: Date;
  // Thêm nested data để form có thể access
  attribute: ProductAttribute;
  attribute_value: ProductAttributeValue;
}

// UPDATED: Thêm variant_attributes field để khớp với form
export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  slug?: string | null;
  price: number;
  stock_quantity: number;
  created_at: Date;
  updated_at: Date;
  // CHANGED: Đổi tên từ 'attributes' thành 'variant_attributes' để khớp với form
  variant_attributes: ProductVariantAttribute[];
  _count?: {
    cartItems: number;
    orderItems: number;
    wishlists: number;
  };
}

export interface ProductReview {
  id: string;
  rating: number;
  comment?: string;
  created_at: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
}

export interface ProductTable {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  subcategory_id: string | null;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  deleted_at: Date | null;
  category: ProductCategory;
  subcategory?: ProductSubcategory | null;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews?: ProductReview[];
  _count: {
    variants: number;
    reviews: number;
  };
}

export interface ProductFilters {
  search: string;
  categoryId: string;
  subcategoryId: string;
  deletedFilter: "true" | "false" | "all";
  priceRange: {
    min: string;
    max: string;
  };
}

export interface PaginationState {
  page: number;
  limit: number;
}
