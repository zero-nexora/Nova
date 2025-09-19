import z from "zod";

export const CreateSubcategorySchema = z.object({
  name: z.string().min(1, "Subcategory name is required"),
  category_id: z.string().uuid("Invalid category ID format"),
  image_url: z.string().url("Invalid image URL format").optional().nullable(),
  public_id: z.string().min(1).optional().nullable(),
});

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

export const DeleteSubcategorySchema = z.object({
  id: z.string().uuid("Invalid subcategory ID format"),
});

export const DeleteMultipleSubcategoriesSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1, "At least one subcategory ID is required"),
});

export const ToggleDeletedMultipleSubcategoriesSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1, "At least one subcategory ID is required"),
});

export type UpdateSubcategoryType = z.infer<typeof UpdateSubcategorySchema>;
export type CreateSubcategoryType = z.infer<typeof CreateSubcategorySchema>;
export type DeleteSubcategoryType = z.infer<typeof DeleteSubcategorySchema>;
export type DeleteMultipleSubcategoriesType = z.infer<
  typeof DeleteMultipleSubcategoriesSchema
>;
export type ToggleDeletedMultipleSubcategoriesType = z.infer<
  typeof ToggleDeletedMultipleSubcategoriesSchema
>;
