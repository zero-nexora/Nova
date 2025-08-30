"use client";

import { useModal } from "@/stores/modal-store";

export const CreateProduct = () => {
  const { openDialog, isOpen } = useModal();

  console.log(isOpen)

  return <div onClick={() => openDialog()}>CreateProduct</div>;
};
