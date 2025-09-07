import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

export const generateSlug = async (
  db: PrismaClient,
  name: string,
  model: "categories" | "subcategories"
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
      existingRecord = await db.categories.findUnique({
        where: { slug },
      });
    } else if (model === "subcategories") {
      existingRecord = await db.subcategories.findUnique({
        where: { slug },
      });
    }

    if (!existingRecord || existingRecord.is_deleted) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
