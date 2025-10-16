"use client";

import Image from "next/image";
import { placeholderImage } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useGetAllCategories } from "@/app/(client)/hooks/categories/use-get-all-categories";
import { ProductSectionHeader } from "@/app/(client)/_components/product-section-header";

interface CategoryBannerProps {
  slugCategory: string;
}

export const CategoryBanner = ({ slugCategory }: CategoryBannerProps) => {
  const { categories } = useGetAllCategories();
  const category = categories.find((cat) => cat.slug === slugCategory);

  if (!category) return;

  return (
    <div className="flex flex-col mb-6">
      <ProductSectionHeader
        title={`Explore "${category.name}"`}
        description={`Find the latest and most popular ${category.name.toLowerCase()} available in our store.`}
      />
      <Card>
        <CardContent className="p-0">
          <div className="relative h-64 sm:h-80 md:h-96">
            <Image
              src={category.image_url || placeholderImage}
              alt={category.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-cente p-6">
                <div className="mb-4 flex justify-center">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-border">
                    <Image
                      src={category.image_url || placeholderImage}
                      alt={`${category.name} icon`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const CategoryBannerSkeleton = () => {
  return (
    <div className="container mx-auto flex flex-col gap-6 mb-8">
      <Skeleton className="h-10 w-64 sm:w-80 mx-auto sm:mx-0" />
      <Card>
        <CardContent className="p-0">
          <div className="relative h-64 sm:h-80 md:h-96">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6 space-y-4">
                <div className="flex justify-center">
                  <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
