import z from "zod";

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
  value: string;
  attribute: Attribute;
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
  id?: string;
  image_url: string;
  public_id: string;
}

export interface ImageInput {
  image_url: string;
  public_id: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  category: Category;
  subcategory: Subcategory | null;
  images: Image[] | null;
  variants: Variant[];
  reviewCount: number;
  variantCount: number;
}

export interface GetAllProductsResponse {
  items: ProductResponse[];
  totalItems: number;
  page: number;
  limit: number;
}

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  categoryId: z.string().uuid("Invalid category ID"),
  subcategoryId: z.string().uuid("Invalid subcategory ID").optional(),
  images: z
    .array(
      z.object({
        image_url: z.string().url("Invalid image URL format"),
        public_id: z.string().min(1, "Public ID is required"),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1, "SKU is required"),
        price: z.number().positive("Price must be positive"),
        stock_quantity: z
          .number()
          .int("Stock must be an integer")
          .nonnegative("Stock must be >= 0"),
        attributeValueIds: z
          .array(z.string().uuid("Invalid attribute value ID"))
          .min(1, "At least one attribute value ID is required"),
      })
    )
    .min(1, "At least one variant is required"),
});

export const UpdateProductSchema = z.object({
  id: z.string().uuid("Invalid product id"),
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  categoryId: z.string().uuid("Invalid category ID"),
  subcategoryId: z.string().uuid("Invalid subcategory ID").optional(),
  images: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        image_url: z.string().url("Invalid image URL format"),
        public_id: z.string().min(1, "Public ID is required"),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        sku: z.string().min(1, "SKU is required"),
        price: z.number().positive("Price must be positive"),
        stock_quantity: z
          .number()
          .int("Stock must be an integer")
          .nonnegative("Stock must be >= 0"),
        attributeValueIds: z
          .array(z.string().uuid("Invalid attribute value ID"))
          .min(1, "At least one attribute value ID is required"),
      })
    )
    .min(1, "At least one variant is required"),
});

export const isDeletedValues = ["true", "false", "all"] as const;

export const GetPaginationProductsSchema = z.object({
  limit: z.number().int().positive().default(10),
  page: z.number().int().positive().default(1),
  search: z.string().optional(),
  slugCategory: z.string().optional(),
  slugSubcategory: z.string().optional(),
  isDeleted: z.enum(isDeletedValues).optional(),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type GetPaginationProductsInput = z.infer<
  typeof GetPaginationProductsSchema
>;

export const toggleSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
});

export const toggleMultipleSchema = z.object({
  ids: z.array(z.string().uuid("Invalid product ID")).min(1, "At least one product ID is required"),
});

export const deleteSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
});

export const deleteMultipleSchema = z.object({
  ids: z.array(z.string().uuid("Invalid product ID")).min(1, "At least one product ID is required"),
});