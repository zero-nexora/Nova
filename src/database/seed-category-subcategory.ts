import { categoriesData } from "@/lib/constants";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import { v4 as uuidv4 } from "uuid";

async function main() {
  for (const cat of categoriesData) {
    const createdCategory = await prisma.categories.create({
      data: {
        id: uuidv4(),
        name: cat.name,
        slug: cat.slug,
        image_url: cat.image_url,
        public_id: cat.public_id,
        subcategories: {
          create: cat.subcategories.map((sub) => ({
            id: uuidv4(),
            name: sub.name,
            slug: sub.slug,
          })),
        },
      },
    });

    console.log(`Created category: ${createdCategory.name}`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
