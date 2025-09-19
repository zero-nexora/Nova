import z from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  image_url: z.string().url("Invalid image URL format").optional().nullable(),
  public_id: z.string().min(1).optional().nullable(),
});

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

export const DeleteCategorySchema = z.object({
  id: z.string().uuid("Invalid category ID format"),
});

export const DeleteMultipleCategoriesSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1, "At least one category ID is required"),
});

export const ToggleDeletedMultipleCategoriesSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1, "At least one category ID is required"),
});

export type CreateCategoryType = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryType = z.infer<typeof UpdateCategorySchema>;
export type DeleteCategoryType = z.infer<typeof DeleteCategorySchema>;
export type DeleteMultipleCategoriesType = z.infer<
  typeof DeleteMultipleCategoriesSchema
>;
export type ToggleDeletedMultipleCategoriesType = z.infer<
  typeof ToggleDeletedMultipleCategoriesSchema
>;
