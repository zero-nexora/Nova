"use client";

import { CreateSubcategoryForm } from "@/components/forms/create-subcategory-form";
import { Button } from "@/components/ui/button";
import { useModal } from "@/stores/modal-store";
import { Plus } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";

export const CreateSubcategory = memo(() => {
  const { open } = useModal();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  
  const handleCreateSubcategory = useCallback(async () => {
    open({
      title: "Create New Subcategory",
      description: "Add a new subcategory to organize your products",
      children: <CreateSubcategoryForm />,
    });
  }, [open]);
  
  if (!isMounted) return null;

  return (
    <Button
      onClick={handleCreateSubcategory}
      size="lg"
      className="gap-2 font-medium shadow-sm hover:shadow-md transition-all duration-200"
    >
      <Plus className="size-4" /> Create Subcategory
    </Button>
  );
});

CreateSubcategory.displayName = "CreateSubcategory";
