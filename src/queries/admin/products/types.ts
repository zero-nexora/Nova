import z from "zod";

export interface Pagination {
  page: number;
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

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  categoryId: z.string().uuid("Invalid category id"),
  subcategoryId: z.string().uuid("Invalid subcategory id").optional(),
  images: z
    .array(
      z.object({
        image_url: z.string().url("Invalid image URL format"),
        public_id: z.string().min(1),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1, "SKU is required"),
        price: z.number().positive("Price must be positive"),
        stock_quantity: z.number().int().nonnegative("Stock must be >= 0"),
        attributeValueIds: z.array(
          z.string().uuid("Invalid attribute value id")
        ),
      })
    )
    .optional(),
});

export const UpdateProductSchema = z.object({
  id: z.string().uuid("Invalid product id"),
  name: z.string().min(1, "Product name is required").optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid("Invalid category id").optional(),
  subcategoryId: z.string().uuid("Invalid subcategory id").optional(),
  images: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        image_url: z.string().url("Invalid image URL format"),
        public_id: z.string().min(1),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1, "SKU is required"),
        price: z.number().positive("Price must be positive"),
        stock_quantity: z.number().int().nonnegative("Stock must be >= 0"),
        attributeValueIds: z
          .array(z.string().uuid("Invalid attribute value id"))
          .min(1, "Each variant must have at least one attribute"),
      })
    )
    .optional(),
});

export const GetAllProductsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  slugCategory: z.string().optional(),
  slugSubcategory: z.string().optional(),
  isDeleted: z.boolean().optional(),
  sortBy: z
    .enum(["price", "name", "created_at", "updated_at"])
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type GetAllProductsInput = z.infer<typeof GetAllProductsSchema>;
