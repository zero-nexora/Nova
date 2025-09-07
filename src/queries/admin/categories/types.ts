import z from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  image_url: z.string().url("Invalid image URL format").optional().nullable(),
  public_id: z.string().min(1).optional().nullable(),
});

export type CreateCategoryType = z.infer<typeof CreateCategorySchema>;

export const GetCategoryByIdSchema = z.object({
  id: z.string().uuid("Invalid category ID format"),
});

export type GetCategoryByIdType = z.infer<typeof GetCategoryByIdSchema>;

export const GetCategoryBySlugSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export type GetCategoryBySlugType = z.infer<typeof GetCategoryBySlugSchema>;

export const UpdateCategorySchema = z.object({
  id: z.string().uuid("Invalid category ID format"),
  name: z
    .string()
    .min(1, "Category name is required")
    .max(255, "Category name too long")
    .optional(),
  image_url: z.string().url("Invalid image URL format").optional().nullable(),
  public_id: z.string().min(1).optional().nullable(),
});

export type UpdateCategoryType = z.infer<typeof UpdateCategorySchema>;

export const DeleteCategorySchema = z.object({
  id: z.string().uuid("Invalid category ID format"),
});

export type DeleteCategoryType = z.infer<typeof DeleteCategorySchema>;
