"use client";

import { CustomConfirm } from "@/components/modals/custom-confirm";
import { CustomModal } from "@/components/modals/custom-modal";
import { useEffect, useState } from "react";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <CustomConfirm />
      <CustomModal />
    </>
  );
};
