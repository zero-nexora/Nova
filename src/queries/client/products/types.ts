import z from "zod";

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductCounts {
  reviews: number;
  variants: number;
}

export interface CategoryBrief {
  id: string;
  name: string;
  slug: string;
}

export interface SubcategoryBrief {
  id: string;
  name: string;
  slug: string;
}

export interface Attribute {
  id: string;
  name: string;
}

export interface AttributeValue {
  id: string;
  value: string;
  attribute: Attribute;
}

export interface VariantAttribute {
  id: string;
  attributeValue: AttributeValue;
}

export interface Variant {
  id: string;
  sku: string;
  price: number;
  stock_quantity: number;
  attributes: VariantAttribute[];
}

export interface VariantInput {
  id?: string;
  sku: string;
  price: number;
  stock_quantity: number;
  attributeValueIds: string[];
}

export interface Image {
  id: string;
  image_url: string;
  public_id: string;
}

export interface ImageInput {
  image_url: string;
  public_id: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  category: CategoryBrief;
  subcategory: SubcategoryBrief | null;
  images: Image[];
  variants: Variant[];
  _count: ProductCounts;
}

export interface GetInfiniteProductsResponse {
  products: Product[];
  nextCursor?: string;
  hasMore: boolean;
}

export const GetInfiniteProductsSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  sortBy: z.enum(['name', 'created_at', 'price']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
});
