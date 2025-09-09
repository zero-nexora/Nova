import slugify from "slugify";
import { PrismaClient } from "@prisma/client";

export const generateCategorySlug = async (
  db: PrismaClient,
  name: string,
  model: "categories" | "subcategories",
  excludeId?: string
) => {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    let existingRecord;

    if (model === "categories") {
      existingRecord = await db.categories.findFirst({
        where: {
          slug,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });
    } else if (model === "subcategories") {
      existingRecord = await db.subcategories.findFirst({
        where: { slug, ...(excludeId && { id: { not: excludeId } }) },
      });
    }

    if (!existingRecord || existingRecord.is_deleted) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
