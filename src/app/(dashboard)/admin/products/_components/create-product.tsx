"use client";

import { useModal } from "@/stores/modal-store";

export const CreateProduct = () => {
  const { open } = useModal();

  return <div onClick={() => open({ title: "Create Product", description: "Create a new product", children: "Create a new product" })}>CreateProduct</div>;
};
