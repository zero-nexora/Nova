import { create } from "zustand";
import { ReactNode } from "react";

interface ModalData {
  title: string;
  description?: string;
  children: ReactNode;
}

interface ModalStore {
  isOpen: boolean;
  data?: ModalData;
  open: (data: ModalData) => void;
  close: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  isOpen: false,
  data: undefined,
  open: (data) => set({ isOpen: true, data }),
  close: () => set({ isOpen: false, data: undefined }),
}));
