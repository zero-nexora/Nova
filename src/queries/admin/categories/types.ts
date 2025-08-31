import z from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  parent_id: z.string().uuid().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  public_id: z.string().optional().nullable(),
});

export const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Category name is required").optional(),
  parent_id: z.string().uuid().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  public_id: z.string().optional().nullable(),
});

export const getCategoryByIdSchema = z.object({
  id: z.string().uuid(),
});

export const getCategoryBySlugSchema = z.object({
  slug: z.string("Slug is required"),
});

export const getCategoriesSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  cursor: z.string().uuid().optional(),
  parent_id: z.string().uuid().optional().nullable(),
  include_deleted: z.boolean().default(false),
  search: z.string().optional(),
});

export const deleteCategorySchema = z.object({
  id: z.string().uuid(),
  hard_delete: z.boolean().default(false),
});
