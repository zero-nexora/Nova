import { db } from "./prisma";
import { attributesData, categoriesData } from "@/lib/constants";

async function clearDatabase() {
  console.log("🧹 Clearing existing data...");

  await db.product_Variants.deleteMany();
  await db.products.deleteMany();
  await db.product_Attributes.deleteMany();
  await db.subcategories.deleteMany();
  await db.categories.deleteMany();

  console.log("✅ Database cleared");
}

async function seedCategories() {
  console.log("🌱 Seeding categories & subcategories...");

  for (const cat of categoriesData) {
    await db.categories.create({
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
  }

  console.log(`✅ Seeded ${categoriesData.length} categories`);
}

async function seedProductAttributes() {
  console.log("🌱 Seeding product attributes...");

  for (const attr of attributesData) {
    await db.product_Attributes.create({
      data: {
        name: attr.name,
        values: {
          create: attr.values,
        },
      },
    });
  }

  console.log(`✅ Seeded ${attributesData.length} product attributes`);
}

async function seedProducts() {
  console.log("🌱 Seeding products...");

  const categories = await db.categories.findMany({
    include: { subcategories: true },
  });

  if (categories.length === 0) {
    throw new Error("No categories found. Please seed categories first.");
  }

  const productsData = Array.from({ length: 12 }).map((_, i) => {
    const category = categories[i % categories.length];
    const subcategory =
      category.subcategories[i % category.subcategories.length];

    return {
      name: `Product ${i + 1}`,
      slug: `product-${i + 1}`,
      description: `This is a description for Product ${i + 1}`,
      category: { connect: { id: category.id } },
      subcategory: { connect: { id: subcategory.id } },
      variants: {
        create: [
          {
            sku: `SKU-${i + 1}-1`,
            slug: `product-${i + 1}-variant-1`,
            price: 10 + i,
            stock_quantity: 100,
          },
          {
            sku: `SKU-${i + 1}-2`,
            slug: `product-${i + 1}-variant-2`,
            price: 20 + i,
            stock_quantity: 50,
          },
        ],
      },
    };
  });

  for (const p of productsData) {
    await db.products.create({ data: p });
  }

  console.log(`✅ Seeded ${productsData.length} products`);
}

async function main() {
  try {
    console.log("🚀 Starting database seeding...");

    await clearDatabase(); // 🧹 dọn trước khi seed

    await seedCategories();
    await seedProductAttributes();
    await seedProducts();

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

main();
