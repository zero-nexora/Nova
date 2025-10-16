"use client";

import { ProductList } from "./product-list";
import { CreateProduct } from "./create-product";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllProducts } from "../hooks/products/use-get-all-products";
import { Error } from "@/components/global/error";
import { useProductFilters } from "../hooks/products/use-product-fillters";

export const ProductView = () => {
  const { filters } = useProductFilters();
  const {
    products,
    totalProducts,
    page,
    error,
    isPending,
    isRefetching,
    limit,
  } = useGetAllProducts({
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    slugCategory: filters.slugCategory || undefined,
    slugSubcategory: filters.slugSubcategory || undefined,
    isDeleted: filters.isDeleted,
    priceMin: filters.priceMin || undefined,
    priceMax: filters.priceMax || undefined,
  });

  if (error) return <Error />;

  if (isPending) return <ProductViewSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex">
        <div className="ml-auto">
          <CreateProduct />
        </div>
      </div>
      <ProductList
        products={products}
        currentPage={page}
        pageSize={limit}
        totalProducts={totalProducts}
        isRefetching={isRefetching || false}
      />
    </div>
  );
};

export const ProductViewSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start">
        <Skeleton className="h-10 w-40 rounded-md ml-auto" />
      </div>

      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div>
          <Skeleton className="h-32 w-full" />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div>
          <Skeleton className="h-96 w-full" />
          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-56" />
          </div>
        </div>
      </div>
    </div>
  );
};
