import { db } from "./prisma";
import { categoriesData } from "@/lib/constants";

async function seedCategories(): Promise<void> {
  console.log("Seeding categories...");

  for (const cat of categoriesData) {
    const createdCategory = await db.categories.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        image_url: cat.image_url,
        public_id: cat.public_id,
        subcategories: {
          create: cat.subcategories.map((sub) => ({
            name: sub.name,
            slug: sub.slug,
          })),
        },
      },
    });

    console.log(`Created category: ${createdCategory.name}`);
  }

  console.log(`Seeded ${categoriesData.length} categories`);
}

async function main(): Promise<void> {
  try {
    console.log("Starting database seeding (categories)...");
    await seedCategories();
    console.log("Seeding categories completed");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

main();
