import slugify from "slugify";
import { Prisma, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Image, ImageInput, Variant, VariantInput } from "./types";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export const generateProductSlug = async (
  db: PrismaClient,
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

export function buildProductWhereClause({
  search,
  categoryId,
  subcategoryId,
  isDeleted,
  priceMin,
  priceMax,
}: {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  isDeleted?: boolean;
  priceMin?: number;
  priceMax?: number;
}): Prisma.ProductsWhereInput {
  const where: Prisma.ProductsWhereInput = {};

  if (search?.trim()) {
    const searchTerm = search.trim();
    where.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
      { slug: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    where.category_id = categoryId;
  }

  if (subcategoryId) {
    where.subcategory_id = subcategoryId;
  }

  if (typeof isDeleted === "boolean") {
    where.is_deleted = isDeleted;
  }

  // Price filtering through variants
  if (priceMin !== undefined || priceMax !== undefined) {
    const priceFilters: Prisma.Product_VariantsWhereInput[] = [];

    if (priceMin !== undefined && priceMin >= 0) {
      priceFilters.push({ price: { gte: priceMin } });
    }

    if (priceMax !== undefined && priceMax >= 0) {
      priceFilters.push({ price: { lte: priceMax } });
    }

    if (priceFilters.length > 0) {
      where.variants = {
        some: {
          AND: priceFilters,
        },
      };
    }
  }

  return where;
}

export function buildProductOrderBy(
  sortBy: string,
  sortOrder: "asc" | "desc"
): Prisma.ProductsOrderByWithRelationInput {
  const validSortFields = ["name", "created_at", "updated_at", "price"];

  if (!validSortFields.includes(sortBy)) {
    return { created_at: "desc" };
  }

  if (sortBy === "price") {
    return {
      variants: {
        _min: {
          price: sortOrder,
        },
      },
    } as Prisma.ProductsOrderByWithRelationInput;
  }

  return { [sortBy]: sortOrder } as Prisma.ProductsOrderByWithRelationInput;
}

export async function validateProductDependencies(
  db: PrismaClient,
  categoryId: string,
  subcategoryId?: string | null
): Promise<void> {
  const category = await db.categories.findFirst({
    where: {
      id: categoryId,
      is_deleted: false,
    },
    select: { id: true },
  });

  if (!category) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Category not found or has been deleted",
    });
  }

  if (subcategoryId) {
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
}

export async function validateVariantData(
  db: PrismaClient,
  variants: VariantInput[],
  excludeProductId?: string
): Promise<void> {
  if (!variants.length) return;

  const allAttributeValueIds = [
    ...new Set(variants.flatMap((variant) => variant.attributeValueIds)),
  ];

  if (allAttributeValueIds.length > 0) {
    const attributeValues = await db.product_Attribute_Values.findMany({
      where: {
        id: { in: allAttributeValueIds },
        is_deleted: false,
      },
      select: { id: true },
    });

    if (attributeValues.length !== allAttributeValueIds.length) {
      const foundIds = attributeValues.map((av) => av.id);
      const missingIds = allAttributeValueIds.filter(
        (id) => !foundIds.includes(id)
      );

      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Some attribute values not found or have been deleted: ${missingIds.join(
          ", "
        )}`,
      });
    }
  }

  const skuList = variants.map((variant) => variant.sku);
  const uniqueSkus = [...new Set(skuList)];

  if (uniqueSkus.length !== skuList.length) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Duplicate SKUs found in variant data",
    });
  }

  const whereClause: Prisma.Product_VariantsWhereInput = {
    sku: { in: skuList },
  };

  if (excludeProductId) {
    whereClause.product = { NOT: { id: excludeProductId } };
  }

  const existingVariants = await db.product_Variants.findMany({
    where: whereClause,
    select: { sku: true },
  });

  if (existingVariants.length > 0) {
    const existingSkus = existingVariants.map((variant) => variant.sku);
    throw new TRPCError({
      code: "CONFLICT",
      message: `SKU(s) already exist: ${existingSkus.join(", ")}`,
    });
  }

  // Validate prices and stock quantities
  const invalidVariants = variants.filter(
    (variant) => variant.price < 0 || variant.stock_quantity < 0
  );

  if (invalidVariants.length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Price and stock quantity must be non-negative",
    });
  }
}

export async function createProductVariant(
  tx: TransactionClient,
  productId: string,
  variantData: VariantInput
): Promise<{ id: string; sku: string; price: number; stock_quantity: number }> {
  const variant = await tx.product_Variants.create({
    data: {
      product_id: productId,
      sku: variantData.sku,
      price: variantData.price,
      stock_quantity: variantData.stock_quantity,
    },
    select: {
      id: true,
      sku: true,
      price: true,
      stock_quantity: true,
    },
  });

  if (variantData.attributeValueIds?.length) {
    await tx.product_Variant_Attributes.createMany({
      data: variantData.attributeValueIds.map((attrValueId: string) => ({
        product_variant_id: variant.id,
        attribute_value_id: attrValueId,
      })),
    });
  }

  return variant;
}

export async function updateProductImages(
  tx: TransactionClient,
  productId: string,
  newImages: ImageInput[],
  existingImages: Image[]
): Promise<void> {
  if (!newImages.length) return;

  const existingPublicIds = new Set(existingImages.map((img) => img.public_id));

  const imagesToCreate = newImages.filter(
    (img) => img.public_id.trim() && !existingPublicIds.has(img.public_id)
  );

  if (imagesToCreate.length > 0) {
    await tx.product_Images.createMany({
      data: imagesToCreate.map((image) => ({
        product_id: productId,
        image_url: image.image_url,
        public_id: image.public_id,
      })),
    });
  }
}

export async function updateProductVariants(
  tx: TransactionClient,
  productId: string,
  newVariants: VariantInput[],
  existingVariants: Variant[]
): Promise<void> {
  if (!newVariants.length) {
    if (existingVariants.length > 0) {
      const existingVariantIds = existingVariants.map((variant) => variant.id);
      await tx.product_Variants.deleteMany({
        where: {
          id: { in: existingVariantIds },
        },
      });
    }
    return;
  }

  const existingVariantIds = new Set(
    existingVariants.map((variant) => variant.id)
  );

  const newVariantIds = new Set(
    newVariants.filter((variant) => variant.id).map((variant) => variant.id)
  );

  const variantsToDelete = existingVariants.filter(
    (variant) => !newVariantIds.has(variant.id)
  );

  if (variantsToDelete.length > 0) {
    const variantsToDeleteIds = variantsToDelete.map((variant) => variant.id);
    await tx.product_Variants.deleteMany({
      where: {
        id: { in: variantsToDeleteIds },
      },
    });
  }

  for (const variant of newVariants) {
    if (variant.id && existingVariantIds.has(variant.id)) {
      await tx.product_Variants.update({
        where: { id: variant.id },
        data: {
          sku: variant.sku,
          price: variant.price,
          stock_quantity: variant.stock_quantity,
          updated_at: new Date(),
        },
      });

      await tx.product_Variant_Attributes.deleteMany({
        where: { product_variant_id: variant.id },
      });

      if (variant.attributeValueIds.length > 0) {
        await tx.product_Variant_Attributes.createMany({
          data: variant.attributeValueIds.map((attrValueId: string) => ({
            product_variant_id: variant.id!,
            attribute_value_id: attrValueId,
          })),
        });
      }
    } else {
      await createProductVariant(tx, productId, variant);
    }
  }
}

// Helper function to calculate average rating
export function calculateAverageRating(
  reviews: Array<{ rating: number | null }>
): number {
  if (!reviews.length) return 0;

  const validRatings = reviews
    .map((r) => r.rating)
    .filter((rating): rating is number => rating !== null && rating > 0);

  if (!validRatings.length) return 0;

  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / validRatings.length) * 100) / 100;
}

// Helper function to get price range for a product
export function getPriceRange(variants: Array<{ price: number }>): {
  min: number;
  max: number;
  hasRange: boolean;
} {
  if (!variants.length) {
    return { min: 0, max: 0, hasRange: false };
  }

  const prices = variants.map((v) => v.price).sort((a, b) => a - b);
  const min = prices[0];
  const max = prices[prices.length - 1];

  return {
    min,
    max,
    hasRange: min !== max,
  };
}

// Helper function to check if product has stock
export function hasStock(variants: Array<{ stock_quantity: number }>): boolean {
  return variants.some((variant) => variant.stock_quantity > 0);
}

// Helper function to get total stock quantity
export function getTotalStock(
  variants: Array<{ stock_quantity: number }>
): number {
  return variants.reduce((total, variant) => total + variant.stock_quantity, 0);
}
