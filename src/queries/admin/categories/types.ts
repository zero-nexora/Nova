import z from "zod";

export interface Subcategory {
  name: string;
  id: string;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  deleted_at: Date | null;
  slug: string;
  public_id: string | null;
  category: {
    id: string;
    name: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  public_id: string | null;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  deleted_at: Date | null;
  subcategories: Subcategory[];
}

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
