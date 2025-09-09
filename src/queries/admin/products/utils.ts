import slugify from "slugify";
import { PrismaClient } from "@prisma/client";

export const generateProductSlug = async (
  db: PrismaClient,
  name: string,
  excludeId?: string
) => {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
  });
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.products.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
