import { Categories } from "@prisma/client";
import z from "zod";

export interface CategorySeedType {
  name: string;
  slug: string;
  image_url: string;
  public_id: string | null;
  children?: CategorySeedType[];
}
export type CategoryTree = Categories & { children: CategoryTree[] };

export interface CategoryColumn {
  id: string;
  name: string;
  parentName?: string | null;
  image_url?: string | null;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

export type CategoryWithChildren = Categories & {
  children?: CategoryWithChildren[];
};

export const UpdateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").optional(),
  parent_id: z.string().uuid().nullable().optional(),
  is_deleted: z.boolean().optional(),
});
