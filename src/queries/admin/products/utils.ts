import slugify from "slugify";
import { Prisma, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { CreateProductInput, UpdateProductInput } from "./types";

export const generateProductSlug = async (
  db: PrismaClient | Prisma.TransactionClient,
  name: string,
  excludeId?: string
): Promise<string> => {
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
      select: { id: true },
    });

    if (!existing) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

export async function validateCategory(db: PrismaClient, categoryId: string) {
  const category = await db.categories.findFirst({
    where: { id: categoryId, is_deleted: false },
    select: { id: true },
  });

  if (!category) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Category not found or has been deleted",
    });
  }
}

export async function validateSubcategory(
  db: PrismaClient,
  subcategoryId: string,
  categoryId: string
) {
  const subcategory = await db.subcategories.findFirst({
    where: {
      id: subcategoryId,
      category_id: categoryId,
      is_deleted: false,
    },
    select: { id: true },
  });

  if (!subcategory) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message:
        "Subcategory not found, deleted, or doesn't belong to the specified category",
    });
  }
}

export async function validateVariants(
  db: PrismaClient,
  variants: CreateProductInput["variants"] = [],
  productId: string | null
) {
  if (!variants) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "At least one variant is required",
    });
  }
  const allAttributeValueIds = [
    ...new Set(variants.flatMap((v) => v.attributeValueIds)),
  ];
  if (allAttributeValueIds.length > 0) {
    const attributeValues = await db.product_Attribute_Values.findMany({
      where: { id: { in: allAttributeValueIds }, is_deleted: false },
      select: { id: true },
    });

    if (attributeValues.length !== allAttributeValueIds.length) {
      const foundIds = attributeValues.map((av) => av.id);
      const missingIds = allAttributeValueIds.filter(
        (id) => !foundIds.includes(id)
      );
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Some attribute values not found or deleted: ${missingIds.join(
          ", "
        )}`,
      });
    }
  }

  const skuList = variants.map((v) => v.sku);
  if (new Set(skuList).size !== skuList.length) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Duplicate SKUs found in variant data",
    });
  }

  const whereClause: Prisma.Product_VariantsWhereInput = {
    sku: { in: skuList },
    ...(productId && { product: { id: { not: productId } } }),
  };
  const existingVariants = await db.product_Variants.findMany({
    where: whereClause,
    select: { sku: true },
  });

  if (existingVariants.length > 0) {
    const existingSkus = existingVariants.map((v) => v.sku);
    throw new TRPCError({
      code: "CONFLICT",
      message: `SKU(s) already exist: ${existingSkus.join(", ")}`,
    });
  }

  const invalidVariants = variants.filter(
    (v) => v.price < 0 || v.stock_quantity < 0
  );
  if (invalidVariants.length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Price and stock quantity must be non-negative",
    });
  }
}

export function getUniqueVariants(
  variants: {
    sku: string;
    price: number;
    stock_quantity: number;
    attributeValueIds: string[];
    id?: string;
  }[]
) {
  const seen = new Map<string, (typeof variants)[0]>();
  for (const variant of variants) {
    const key = variant.attributeValueIds.sort().join(",");
    seen.set(key, variant);
  }
  return Array.from(seen.values());
}

export async function createVariants(
  tx: Prisma.TransactionClient,
  productId: string,
  variants: CreateProductInput["variants"]
) {
  if (!variants) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "At least one variant is required",
    });
  }
  for (const variant of variants) {
    const createdVariant = await tx.product_Variants.create({
      data: {
        product_id: productId,
        sku: variant.sku,
        price: variant.price,
        stock_quantity: variant.stock_quantity,
      },
      select: { id: true },
    });

    if (variant.attributeValueIds?.length) {
      await tx.product_Variant_Attributes.createMany({
        data: variant.attributeValueIds.map((attrValueId) => ({
          product_variant_id: createdVariant.id,
          attribute_value_id: attrValueId,
        })),
      });
    }
  }
}

export async function createOrUpdateVariants(
  tx: Prisma.TransactionClient,
  productId: string,
  variants: UpdateProductInput["variants"],
  existingVariantIds: Set<string>
) {
  if (!variants || variants.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "At least one variant is required",
    });
  }

  const variantsToUpdate = variants.filter(
    (v) => v.id && existingVariantIds.has(v.id)
  );
  const variantsToCreate = variants.filter(
    (v) => !v.id || !existingVariantIds.has(v.id)
  );

  for (const variant of variantsToUpdate) {
    try {
      await tx.product_Variants.update({
        where: { id: variant.id! },
        data: {
          sku: variant.sku,
          price: variant.price,
          stock_quantity: variant.stock_quantity,
          updated_at: new Date(),
        },
      });

      await tx.product_Variant_Attributes.deleteMany({
        where: { product_variant_id: variant.id! },
      });

      if (variant.attributeValueIds && variant.attributeValueIds.length > 0) {
        await tx.product_Variant_Attributes.createMany({
          data: variant.attributeValueIds.map((attrValueId) => ({
            product_variant_id: variant.id!,
            attribute_value_id: attrValueId,
          })),
        });
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to update variant ${variant.id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  }

  for (const variant of variantsToCreate) {
    try {
      const newVariant = await tx.product_Variants.create({
        data: {
          product_id: productId,
          sku: variant.sku,
          price: variant.price,
          stock_quantity: variant.stock_quantity,
        },
        select: { id: true },
      });

      if (variant.attributeValueIds && variant.attributeValueIds.length > 0) {
        await tx.product_Variant_Attributes.createMany({
          data: variant.attributeValueIds.map((attrValueId) => ({
            product_variant_id: newVariant.id,
            attribute_value_id: attrValueId,
          })),
        });
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to create variant: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  }
}
export async function fetchProductWithRelations(db: PrismaClient, id: string) {
  return db.products.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      is_deleted: true,
      category: { select: { id: true, is_deleted: true } },
      subcategory: { select: { id: true, is_deleted: true } },
    },
  });
}

export function validateCategoryAndSubcategory(
  product: NonNullable<Awaited<ReturnType<typeof fetchProductWithRelations>>>
) {
  if (product.category.is_deleted || product.subcategory?.is_deleted) {
    throw new TRPCError({
      code: "CONFLICT",
      message:
        "Cannot toggle product status because its category or subcategory is deleted",
    });
  }
}

export async function deleteProductDependencies(
  tx: Prisma.TransactionClient,
  productIds: string | string[],
  variantIds: string[]
) {
  if (Array.isArray(productIds)) {
    if (variantIds.length) {
      await tx.cart_Items.deleteMany({
        where: { product_variant_id: { in: variantIds } },
      });
    }
    await tx.wishlists.deleteMany({
      where: { product_id: { in: productIds } },
    });
  } else {
    if (variantIds.length) {
      await tx.cart_Items.deleteMany({
        where: { product_variant_id: { in: variantIds } },
      });
    }
    await tx.wishlists.deleteMany({ where: { product_id: productIds } });
  }
}
