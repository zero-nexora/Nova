"use client";

// import { CreateProduct } from "./create-product";
import { Skeleton } from "@/components/ui/skeleton";
import { Error } from "@/components/global/error";
import { useGetAllProductAttributes } from "../../products/hooks/products/use-get-all-product-attributes";
import { ProductAttributesTable } from "./product-attributes-table";

export const ProductAttributesView = () => {
  const {productAttributes, error} = useGetAllProductAttributes();

  if (error) return <Error />;

  return (
    <div className="space-y-6">
      <div className="flex">
        <div className="ml-auto">
          {/* <CreateProduct /> */}
        </div>
      </div>
      <ProductAttributesTable
        productAttributes={productAttributes}
      />
    </div>
  );
};

export const ProductAttributesViewSkeleton = () => {
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
