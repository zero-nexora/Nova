import type { Categories } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CategoryTree } from "./types";

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


// export async function generateUniqueSlug(
//   prisma: PrismaClient,
//   name: string,
//   excludeId?: string
// ): Promise<string> {
//   const baseSlug = slugify(name, slugifyConfig);
//   let slug = baseSlug;
//   let counter = 1;

//   while (true) {
//     const existingCategory = await prisma.categories.findFirst({
//       where: {
//         slug,
//         is_deleted: false,
//         ...(excludeId ? { id: { not: excludeId } } : {}),
//       },
//     });

//     if (!existingCategory) {
//       break;
//     }

//     slug = `${baseSlug}-${counter}`;
//     counter++;
//   }

//   return slug;
// }

// // Check for cycles in category tree
// async function checkForCycle(
//   prisma: PrismaClient,
//   categoryId: string,
//   newParentId: string
// ): Promise<boolean> {
//   let currentParentId = newParentId;
//   const visited = new Set<string>();

//   while (currentParentId) {
//     if (visited.has(currentParentId)) {
//       return true; // Cycle detected
//     }

//     if (currentParentId === categoryId) {
//       return true; // categoryId would become parent of itself
//     }

//     visited.add(currentParentId);

//     const parent = await prisma.categories.findFirst({
//       where: {
//         id: currentParentId,
//         is_deleted: false,
//       },
//       select: {
//         parent_id: true,
//       },
//     });

//     if (!parent) {
//       break;
//     }

//     currentParentId = parent.parent_id;
//   }

//   return false;
// }