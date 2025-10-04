import slugify from "slugify";
import { PrismaClient } from "@prisma/client";

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
