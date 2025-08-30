"use client";

import { AppModal } from "@/components/modals/app-modal";
import { useEffect, useState } from "react";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div>
      <AppModal title="test" description="test">test</AppModal>
    </div>
  )
}
