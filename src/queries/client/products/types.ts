import { DEFAULT_LIMIT } from "@/lib/constants";
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

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Subcategory {
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
  category: Category;
  subcategory: Subcategory | null;
  images: Image[];
  variants: Variant[];
  _count: ProductCounts;
}

export interface GetInfiniteProductsResponse {
  products: Product[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface ProductAttributeValue {
  id: string;
  value: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  values: ProductAttributeValue[];
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  // reviews: any[];
  images: Image[];
  updated_at: Date;
  category: Category;
  subcategory: Subcategory | null;
  variants: Variant[];
  attributes: ProductAttribute[];
}

export const GetInfiniteProductsSchema = z.object({
  limit: z.number().min(1).max(100).default(DEFAULT_LIMIT),

  cursor: z
    .object({
      id: z.string().uuid(),
      updatedAt: z.date(),
    })
    .nullish(),

  search: z.string().optional(),

  slugCategory: z.string().optional(),
  slugSubcategory: z.string().optional(),

  sortBy: z
    .enum([
      "curated",
      "trending",
      "hot_and_new",
      "price_asc",
      "price_desc",
      "name_asc",
      "name_desc",
      "newest",
      "oldest",
      "stock_high",
      "stock_low",
      "rating_high",
    ])
    .default("curated"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),

  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),

  excludeSlugs: z.array(z.string()).optional(),
});
