"use client";

import { Plus } from "lucide-react";
import { useModal } from "@/stores/modal-store";
import { Button } from "@/components/ui/button";
import { memo, useCallback } from "react";
import { CreateProductForm } from "@/components/forms/product/create-product-form";

export const CreateProduct = memo(() => {
  const { open } = useModal();

  const handleCreateProduct = useCallback(async () => {
    open({
      title: "Create New Product",
      description: "Add a new product to organize your products",
      children: <CreateProductForm />,
    });
  }, [open]);

  return (
    <Button
      onClick={handleCreateProduct}
      size="lg"
      className="gap-2 font-medium shadow-sm hover:shadow-md transition-all duration-200"
    >
      <Plus className="size-4" /> Create Product
    </Button>
  );
});

CreateProduct.displayName = "CreateProduct";
