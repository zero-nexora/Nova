"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/stores/modal-store";

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

        {data?.footer && (
          <div className="mt-4 flex justify-end gap-2">{data.footer}</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
