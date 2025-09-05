import type { Categories } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CategoryTree } from "./types";
import { Category } from "@/stores/admin/categories-store";
import { CategoryRow } from "@/app/(admin)/admin/categories/_components/columns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildCategoryTree(
  categories: Categories[],
  parentId: string | null = null
): CategoryTree[] {
  return categories
    .filter((category) => category.parent_id === parentId)
    .map((category) => ({
      ...category,
      children: buildCategoryTree(categories, category.id),
    }));
}

export function flattenCategories(categories: Category[]): CategoryRow[] {
  const result: CategoryRow[] = [];

  const traverse = (cats: Category[], parentName: string | null = null) => {
    cats.forEach((cat) => {
      result.push({
        id: cat.id,
        name: cat.name,
        image_url: cat.image_url,
        created_at: cat.created_at,
        updated_at: cat.updated_at,
        is_deleted: cat.is_deleted,
        parentName: parentName ?? "Root",
        public_id: cat.public_id,
        parentId: cat.parent?.id || null,
      });

      if (cat.children?.length) {
        traverse(cat.children, cat.name);
      }
    });
  };

  traverse(categories);
  return result;
}

export const generateUniqueId = (): string => crypto.randomUUID();

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(fileReader.result as string);
    fileReader.onerror = reject;
    fileReader.readAsDataURL(file);
  });
};
