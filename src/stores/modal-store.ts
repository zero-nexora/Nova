import { create } from "zustand";

interface ModalProps {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

export const useModal = create<ModalProps>((set) => ({
  isOpen: false,
  openDialog: () => set({ isOpen: true }),
  closeDialog: () => set({ isOpen: false }),
}));
