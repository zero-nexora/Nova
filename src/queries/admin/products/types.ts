import z from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category_id: z.string().uuid("Category ID must be a valid UUID"),
  subcategory_id: z.string().uuid().optional(),
});

export type CreateProductType = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  subcategory_id: z.string().uuid().optional(),
});

export type UpdateProductType = z.infer<typeof UpdateProductSchema>;

export const DeleteProductSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
});

export type DeleteProductType = z.infer<typeof DeleteProductSchema>;

export const CreateProductImageSchema = z.object({
  image_url: z.string().url("Invalid image URL format").optional().nullable(),
  public_id: z.string().min(1).optional().nullable(),
});

export type CreateProductImageType = z.infer<typeof CreateProductImageSchema>;

export const DeleteProductImageSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
});

export type DeleteProductImageType = z.infer<typeof DeleteProductImageSchema>;

export const CreateProductVariantSchema = z.object({
  product_id: z.string().uuid("Product ID must be a valid UUID"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  stock_quantity: z
    .number()
    .int()
    .min(0, "Stock quantity must be a non-negative integer"),
});

export type CreateProductVariantType = z.infer<
  typeof CreateProductVariantSchema
>;

export const UpdateProductVariantSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  sku: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  stock_quantity: z.number().int().min(0).optional(),
});

export type UpdateProductVariantType = z.infer<
  typeof UpdateProductVariantSchema
>;

export const DeleteProductVariantSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
});

export type DeleteProductVariantType = z.infer<
  typeof DeleteProductVariantSchema
>;

export const CreateProductAttributeSchema = z.object({
  name: z.string().min(1, "Attribute name is required"),
});

export type CreateProductAttributeType = z.infer<
  typeof CreateProductAttributeSchema
>;

export const UpdateProductAttributeSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  name: z.string().min(1, "Attribute name is required"),
});

export type UpdateProductAttributeType = z.infer<
  typeof UpdateProductAttributeSchema
>;

export const DeleteProductAttributeSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
});

export type DeleteProductAttributeType = z.infer<
  typeof DeleteProductAttributeSchema
>;

export const CreateProductAttributeValueSchema = z.object({
  attribute_id: z.string().uuid("Attribute ID must be a valid UUID"),
  value: z.string().min(1, "Value is required"),
});

export type CreateProductAttributeValueType = z.infer<
  typeof CreateProductAttributeValueSchema
>;

export const UpdateProductAttributeValueSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  value: z.string().min(1, "Value is required"),
});

export type UpdateProductAttributeValueType = z.infer<
  typeof UpdateProductAttributeValueSchema
>;

export const DeleteProductAttributeValueSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
});

export type DeleteProductAttributeValueType = z.infer<
  typeof DeleteProductAttributeValueSchema
>;
