"use client";

import { CreateCategoryForm } from "@/components/forms/create-category-form";
import { Button } from "@/components/ui/button";
import { useModal } from "@/stores/modal-store";
import { Plus } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";

export const CreateCategory = memo(() => {
  const { open } = useModal();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  
  const handleCreateCategory = useCallback(async () => {
    open({
      title: "Create New Category",
      description: "Add a new category to organize your products",
      children: <CreateCategoryForm />,
    });
  }, [open]);
  
  if (!isMounted) return null;

  return (
    <Button
      onClick={handleCreateCategory}
      size="lg"
      className="gap-2 font-medium shadow-sm hover:shadow-md transition-all duration-200"
    >
      <Plus className="size-4" /> Create Category
    </Button>
  );
});

CreateCategory.displayName = "CreateCategory";
