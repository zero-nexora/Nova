export interface ProductImage {
  id: string;
  image_url: string;
  public_id: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock_quantity: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug?: string;
}

export interface ProductSubcategory {
  id: string;
  name: string;
  slug?: string;
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
  category: ProductCategory;
  subcategory?: ProductSubcategory | null;
  images: ProductImage[];
  variants: ProductVariant[];
  _count?: {
    variants?: number;
    reviews?: number;
  };
}

export interface ProductFilters {
  search: string;
  categoryId: string;
  subcategoryId: string;
  deletedFilter: string;
  priceRange: {
    min: string;
    max: string;
  };
}

export interface PaginationState {
  page: number;
  limit: number;
}
