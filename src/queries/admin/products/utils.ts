import slugify from "slugify";
import { Prisma, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

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

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
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
    const priceFilters = [];
    if (priceMin !== undefined) priceFilters.push({ price: { gte: priceMin } });
    if (priceMax !== undefined) priceFilters.push({ price: { lte: priceMax } });

    where.variants = {
      some: {
        AND: [{ is_deleted: false }, ...priceFilters],
      },
    };
  }

  return where;
}

export function buildProductOrderBy(
  sortBy: string,
  sortOrder: "asc" | "desc"
): Prisma.ProductsOrderByWithRelationInput {
  if (sortBy === "price") {
    return {
      variants: {
        _min: {
          price: {
            [sortOrder]: true,
          },
        },
      },
    } as any;
  }

  return { [sortBy]: sortOrder };
}

export function getProductIncludeOptions(): Prisma.ProductsInclude {
  return {
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    subcategory: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    images: {
      select: {
        id: true,
        image_url: true,
      },
    },
    variants: {
      where: { is_deleted: false },
      select: {
        id: true,
        sku: true,
        slug: true,
        price: true,
        stock_quantity: true,
        attributes: {
          include: {
            attributeValue: {
              include: {
                attribute: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    },
    _count: {
      select: {
        reviews: true,
      },
    },
  };
}

export function getDetailedProductIncludeOptions(): Prisma.ProductsInclude {
  return {
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    subcategory: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    images: {
      select: {
        id: true,
        image_url: true,
        created_at: true,
      },
    },
    variants: {
      where: { is_deleted: false },
      include: {
        attributes: {
          include: {
            attributeValue: {
              include: {
                attribute: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    },
    reviews: {
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    },
  };
}

export async function validateProductDependencies(
  db: PrismaClient,
  categoryId: string,
  subcategoryId?: string
) {
  // Check if category exists and is not deleted
  const category = await db.categories.findFirst({
    where: { id: categoryId, is_deleted: false },
  });

  if (!category) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Category not found or has been deleted",
    });
  }

  // Check subcategory if provided
  if (subcategoryId) {
    const subcategory = await db.subcategories.findFirst({
      where: {
        id: subcategoryId,
        category_id: categoryId,
        is_deleted: false,
      },
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
  variants: any[],
  excludeProductId?: string
) {
  // Validate attribute value IDs
  const allAttributeValueIds = variants.flatMap((v) => v.attributeValueIds);
  const uniqueAttributeValueIds = [...new Set(allAttributeValueIds)];

  if (uniqueAttributeValueIds.length > 0) {
    const attributeValues = await db.product_Attribute_Values.findMany({
      where: {
        id: { in: uniqueAttributeValueIds },
        is_deleted: false,
      },
    });

    if (attributeValues.length !== uniqueAttributeValueIds.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Some attribute values not found or have been deleted",
      });
    }
  }

  // Check SKU uniqueness (excluding current product variants if updating)
  const skuList = variants.map((v) => v.sku);
  const whereClause: any = { sku: { in: skuList } };

  if (excludeProductId) {
    whereClause.product = { NOT: { id: excludeProductId } };
  }

  const existingVariants = await db.product_Variants.findMany({
    where: whereClause,
  });

  if (existingVariants.length > 0) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `SKU(s) already exist: ${existingVariants
        .map((v) => v.sku)
        .join(", ")}`,
    });
  }
}

export async function createProductVariant(
  tx: any,
  productId: string,
  variantData: any
) {
  const variant = await tx.product_Variants.create({
    data: {
      product_id: productId,
      sku: variantData.sku,
      price: variantData.price,
      stock_quantity: variantData.stock_quantity,
    },
  });

  if (variantData.attributeValueIds.length > 0) {
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
  tx: any,
  productId: string,
  newImages: any[],
  existingImages: any[]
) {
  // Get existing image URLs for comparison
  const existingImageUrls = new Set(existingImages.map((img) => img.image_url));

  // Filter out images that already exist
  const imagesToCreate = newImages.filter(
    (img) => img.image_url && !existingImageUrls.has(img.image_url)
  );

  // Create new images
  if (imagesToCreate.length > 0) {
    await tx.product_Images.createMany({
      data: imagesToCreate.map((image) => ({
        product_id: productId,
        image_url: image.image_url || "",
        public_id: image.public_id || "",
      })),
    });
  }

  // Note: We don't delete existing images automatically
  // This should be handled by a separate endpoint for image management
}

export async function updateProductVariants(
  tx: any,
  productId: string,
  newVariants: any[],
  existingVariants: any[]
) {
  const existingVariantIds = new Set(existingVariants.map((v) => v.id));
  const newVariantIds = new Set(
    newVariants.filter((v) => v.id).map((v) => v.id)
  );

  // Soft delete variants not in the new list
  const variantsToDelete = existingVariants.filter(
    (v) => !newVariantIds.has(v.id)
  );

  if (variantsToDelete.length > 0) {
    await tx.product_Variants.updateMany({
      where: { id: { in: variantsToDelete.map((v) => v.id) } },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  // Update or create variants
  for (const variant of newVariants) {
    if (variant.id && existingVariantIds.has(variant.id)) {
      // Update existing variant
      await tx.product_Variants.update({
        where: { id: variant.id },
        data: {
          sku: variant.sku,
          price: variant.price,
          stock_quantity: variant.stock_quantity,
          updated_at: new Date(),
        },
      });

      // Delete existing attributes and recreate
      await tx.product_Variant_Attributes.deleteMany({
        where: { product_variant_id: variant.id },
      });

      if (variant.attributeValueIds.length > 0) {
        await tx.product_Variant_Attributes.createMany({
          data: variant.attributeValueIds.map((attrValueId: string) => ({
            product_variant_id: variant.id,
            attribute_value_id: attrValueId,
          })),
        });
      }
    } else {
      // Create new variant
      await createProductVariant(tx, productId, variant);
    }
  }
}
