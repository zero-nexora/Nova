import z from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  categoryId: z.string().uuid("Invalid category id"),
  subcategoryId: z.string().uuid("Invalid subcategory id").optional(),
  images: z
    .array(
      z.object({
        image_url: z
          .string()
          .url("Invalid image URL format")
          .optional()
          .nullable(),
        public_id: z.string().min(1).optional().nullable(),
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
        image_url: z
          .string()
          .url("Invalid image URL format")
          .optional()
          .nullable(),
        public_id: z.string().min(1).optional().nullable(),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        id: z.string().uuid("Invalid variant id").optional(), // Only for existing variants
        sku: z.string().min(1, "SKU is required"),
        price: z.number().positive("Price must be positive"),
        stock_quantity: z.number().int().nonnegative("Stock must be >= 0"),
        attributeValueIds: z
          .array(z.string().uuid("Invalid attribute value id"))
          .optional(), // Make this optional, not required
      })
    )
    .optional(),
});

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

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type GetAllProductsInput = z.infer<typeof GetAllProductsSchema>;
