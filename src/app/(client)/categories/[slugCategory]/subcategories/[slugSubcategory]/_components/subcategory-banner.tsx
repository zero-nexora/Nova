"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { placeholderImage } from "@/lib/constants";
import { useCategoriesStore } from "@/stores/client/categories-store";
import Image from "next/image";

interface SubcategoryBannerProps {
  slugCategory: string;
  slugSubcategory: string; // Changed to slugSubcategory
}

export const SubcategoryBanner = ({
  slugCategory,
  slugSubcategory,
}: SubcategoryBannerProps) => {
  const { categories, loading: isSubcategoriesLoading } = useCategoriesStore();
  const category = categories.find((cat) => cat.slug === slugCategory);
  const subcategory = category?.subcategories.find(
    (sub) => sub.slug === slugSubcategory
  );

  if (isSubcategoriesLoading) return <SubcategoryBannerSkeleton />;

  if (!category || !subcategory) {
    return (
      <div className="text-center text-muted-foreground py-4">
        Category or Subcategory not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-4 flex flex-col gap-6">
      <h1 className="text-3xl sm:text-4xl font-bold">
        {category?.name} <span className="text-muted-foreground font-medium">/</span> {subcategory.name}
      </h1>
      <Card>
        <CardContent className="p-0">
          <div className="relative h-64 sm:h-80 md:h-96">
            {/* Main Banner Image */}
            <Image
              src={subcategory.image_url || placeholderImage}
              alt={subcategory.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white p-6">
                {/* Small Image */}
                <div className="mb-4 flex justify-center">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-border">
                    <Image
                      src={subcategory.image_url || placeholderImage}
                      alt={`${subcategory.name} icon`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                {/* Subcategory Name and Description */}
                <p className="text-sm sm:text-base max-w-md mx-auto">
                  Discover the best of {subcategory.name.toLowerCase()} with our
                  curated collection.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SubcategoryBannerSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 mt-4 flex flex-col gap-6">
      {/* Title Skeleton */}
      <Skeleton className="h-9 w-64 sm:w-80 mx-auto sm:mx-0" />

      <Card>
        <CardContent className="p-0">
          <div className="relative h-64 sm:h-80 md:h-96">
            {/* Main Banner Image Skeleton */}
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6 space-y-4">
                {/* Small Image Skeleton */}
                <div className="flex justify-center">
                  <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
                </div>
                {/* Description Skeleton */}
                <Skeleton className="h-4 w-64 sm:w-80 mx-auto" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
