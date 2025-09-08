"use client";

import { useModal } from "@/stores/modal-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const CustomModal = () => {
  const { isOpen, data, close } = useModal();

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">{data?.title}</DialogTitle>
          {data?.description && (
            <DialogDescription>{data.description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="py-2">{data?.children}</div>
      </DialogContent>
    </Dialog>
  );
};
