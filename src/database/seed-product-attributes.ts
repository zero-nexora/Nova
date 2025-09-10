import { db } from "./prisma";
import { attributesData } from "@/lib/constants";

async function seedProductAttributes(): Promise<void> {
  console.log("Seeding product attributes...");

  for (const attr of attributesData) {
    const createdAttr = await db.product_Attributes.create({
      data: {
        name: attr.name,
        values: {
          create: attr.values.map((val) => ({
            value: val.value,
          })),
        },
      },
    });

    console.log(`Created attribute: ${createdAttr.name}`);
  }

  console.log(`Seeded ${attributesData.length} product attributes`);
}

async function main(): Promise<void> {
  try {
    console.log("Starting database seeding (product attributes)...");
    await seedProductAttributes();
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

main();
