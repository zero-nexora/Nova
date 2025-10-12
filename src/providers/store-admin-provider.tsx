"use client";

import { useEffect } from "react";
import { Error } from "@/components/global/error";

import { useGetAllCategories } from "@/app/(admin)/admin/categories/hooks/categories/use-get-all-categories";
import { useGetAllProductAttributes } from "@/app/(admin)/admin/products/hooks/products/use-get-all-product-attributes";

import { useCategoriesStore } from "@/stores/admin/categories-store";
import { useProductAttributesStore } from "@/stores/admin/product-attribute-store";

interface StoreAdminProviderProps {
  children: React.ReactNode;
}

export const StoreAdminProvider = ({ children }: StoreAdminProviderProps) => {
  const { setCategories } = useCategoriesStore();
  const { setProductAttributes } = useProductAttributesStore();

  const { categories, error: categoriesError } = useGetAllCategories();

  const { productAttributes, error: productAttributesError } =
    useGetAllProductAttributes();

  useEffect(() => {
    if (categories?.length) setCategories(categories);
  }, [categories, setCategories]);

  useEffect(() => {
    if (productAttributes?.length) setProductAttributes(productAttributes);
  }, [productAttributes, setProductAttributes]);

  if (categoriesError || productAttributesError) return <Error />;

  return <>{children}</>;
};
