"use client";

import { CreateCategoryForm } from "@/components/forms/create-category-form";
import { Button } from "@/components/ui/button";
import { useModal } from "@/stores/modal-store";
import React from "react";

export const CreateCategory = () => {
  const { open } = useModal();

  return (
    <div>
      <Button onClick={() => open({ title: "Create Category", description: "Create a new category", children: <CreateCategoryForm /> })}>Create</Button>
    </div>
  );
};
