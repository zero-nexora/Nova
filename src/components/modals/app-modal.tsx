"use client";

import { useModal } from "@/stores/modal-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppModalProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const AppModal = ({ title, description, children }: AppModalProps) => {
  const { isOpen, closeDialog } = useModal();

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="overflow-auto md:max-h-[700px] md:h-fit h-screen bg-card">
        <DialogHeader className="pt-8 text-left">
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          {children}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
