import { create } from "zustand";
import { ReactNode } from "react";

interface ConfirmData {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning";
  icon?: ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmStore {
  isOpen: boolean;
  data?: ConfirmData;
  open: (data: ConfirmData) => void;
  close: () => void;
  confirm: () => Promise<void>;
  cancel: () => void;
}

export const useConfirm = create<ConfirmStore>((set, get) => ({
  isOpen: false,
  data: undefined,
  open: (data) => set({ isOpen: true, data }),
  close: () => set({ isOpen: false, data: undefined }),
  confirm: async () => {
    const { data, close } = get();
    if (data?.onConfirm) {
      await data.onConfirm();
    }
    close();
  },
  cancel: () => {
    const { data, close } = get();
    if (data?.onCancel) {
      data.onCancel();
    }
    close();
  },
}));
