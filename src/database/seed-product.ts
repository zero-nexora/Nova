import { db } from "./prisma";
import { attributesData, categoriesData } from "@/lib/constants";

async function clearDatabase() {
  console.log("🧹 Clearing existing data...");

  await db.product_Variant_Attributes.deleteMany();
  await db.product_Variants.deleteMany();
  await db.product_Attribute_Values.deleteMany();
  await db.product_Attributes.deleteMany();
  await db.product_Images.deleteMany();
  await db.products.deleteMany();
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
            image_url: sub.image_url || null,
            public_id: sub.public_id || null,
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
          create: attr.values.map((val: { value: string }) => ({
            value: val.value,
          })),
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

  const attributes = await db.product_Attributes.findMany({
    include: { values: true },
  });

  if (categories.length === 0) {
    throw new Error("No categories found. Please seed categories first.");
  }

  if (attributes.length === 0) {
    throw new Error(
      "No attributes found. Please seed product attributes first."
    );
  }

  const productsData = Array.from({ length: 40 }).map((_, i) => {
    const category = categories[i % categories.length];
    const subcategory =
      category.subcategories[i % category.subcategories.length];

    return {
      name: `Product ${i + 1}`,
      slug: `product-${i + 1}`,
      description: `This is a description for Product ${i + 1}`,
      category: { connect: { id: category.id } },
      subcategory: { connect: { id: subcategory.id } },
    };
  });

  for (const p of productsData) {
    const product = await db.products.create({ data: p });

    for (let j = 1; j <= 2; j++) {
      const variant = await db.product_Variants.create({
        data: {
          product_id: product.id,
          sku: `SKU-${product.slug}-${j}`,
          slug: `${product.slug}-variant-${j}`,
          price: 10 * j,
          stock_quantity: 100 * j,
        },
      });

      const randomAttr =
        attributes[Math.floor(Math.random() * attributes.length)];
      const randomValue =
        randomAttr.values[Math.floor(Math.random() * randomAttr.values.length)];

      await db.product_Variant_Attributes.create({
        data: {
          product_variant_id: variant.id,
          attribute_value_id: randomValue.id,
        },
      });
    }
  }

  console.log(
    `✅ Seeded ${productsData.length} products with variants & attributes`
  );
}

async function main() {
  try {
    console.log("🚀 Starting database seeding...");

    await clearDatabase();
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
