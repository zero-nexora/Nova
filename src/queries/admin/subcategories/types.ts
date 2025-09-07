import z from "zod";

export const CreateSubcategorySchema = z.object({
  name: z.string().min(1, "Subcategory name is required"),
  category_id: z.string().uuid("Invalid category ID format"),
  image_url: z.string().url("Invalid image URL format").optional().nullable(),
  public_id: z.string().min(1).optional().nullable(),
});

export type CreateSubcategoryType = z.infer<typeof CreateSubcategorySchema>;

export const GetSubcategoryByIdSchema = z.object({
  id: z.string().uuid("Invalid subcategory ID format"),
});

export type GetSubcategoryByIdType = z.infer<typeof GetSubcategoryByIdSchema>;

export const GetSubcategoryBySlugSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export type GetSubcategoryBySlugType = z.infer<
  typeof GetSubcategoryBySlugSchema
>;

export const UpdateSubcategorySchema = z.object({
  id: z.string().uuid("Invalid subcategory ID format"),
  name: z
    .string()
    .min(1, "Subcategory name is required")
    .max(255, "Subcategory name too long")
    .optional(),
  category_id: z.string().uuid("Invalid category ID format").optional(),
  image_url: z.string().url("Invalid image URL format").optional().nullable(),
  public_id: z.string().min(1).optional().nullable(),
});

export type UpdateSubcategoryType = z.infer<typeof UpdateSubcategorySchema>;


export const DeleteSubcategorySchema = z.object({
  id: z.string().uuid("Invalid subcategory ID format"),
});

export type DeleteSubcategoryType = z.infer<typeof DeleteSubcategorySchema>;