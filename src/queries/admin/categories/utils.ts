import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

export const generateSlug = async (db: PrismaClient, name: string) => {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingCategory = await db.categories.findUnique({
      where: { slug: baseSlug },
    });

    if (!existingCategory || existingCategory.is_deleted) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
