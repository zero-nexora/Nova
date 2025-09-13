// stores/productAttributesStore.ts
import { create } from "zustand";

// Định nghĩa interface cho 1 Value
export interface ProductAttributeValue {
  id: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  deleted_at: Date | null;
  value: string;
  attribute_id: string;
}

// Định nghĩa interface cho 1 Attribute
export interface ProductAttribute {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  deleted_at: Date | null;
  values: ProductAttributeValue[];
}

interface ProductAttributesState {
  productAttributes: ProductAttribute[];
  loading: boolean;
  error: any;
  setProductAttributes: (attributes: ProductAttribute[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: any) => void;
}

export const useProductAttributesStore = create<ProductAttributesState>(
  (set) => ({
    productAttributes: [],
    loading: false,
    error: "",

    setProductAttributes: (attributes: ProductAttribute[]) =>
      set({ productAttributes: attributes }),
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: any) => set({ error }),

    reset: () =>
      set({
        productAttributes: [],
        loading: false,
        error: null,
      }),
  })
);
