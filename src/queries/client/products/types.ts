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

export interface GetAllProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export const GetAllProductsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  subcategoryId: z.string().uuid().optional(),
  isDeleted: z.boolean().optional(),
  sortBy: z
    .enum(["price", "name", "created_at", "updated_at"])
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
});

export type GetAllProductsInput = z.infer<typeof GetAllProductsSchema>;
