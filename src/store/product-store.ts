import { create } from "zustand";
import { Product } from "@/types/product";
import { INITIAL_PRODUCTS } from "@/data/demo-products";
import { getStorageItem, setStorageItem } from "@/lib/storage";

interface ProductStore {
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  reduceStock: (items: { productId: string; quantity: number }[]) => void;
  resetProducts: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: getStorageItem<Product[]>("luxury_products", INITIAL_PRODUCTS),
  addProduct: (prod) =>
    set((state) => {
      const newProduct: Product = {
        ...prod,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
      };
      const updated = [newProduct, ...state.products];
      setStorageItem("luxury_products", updated);
      return { products: updated };
    }),
  updateProduct: (id, updatedFields) =>
    set((state) => {
      const updated = state.products.map((p) =>
        p.id === id ? { ...p, ...updatedFields } : p
      );
      setStorageItem("luxury_products", updated);
      return { products: updated };
    }),
  deleteProduct: (id) =>
    set((state) => {
      const updated = state.products.filter((p) => p.id !== id);
      setStorageItem("luxury_products", updated);
      return { products: updated };
    }),
  reduceStock: (items) =>
    set((state) => {
      const updated = state.products.map((p) => {
        const item = items.find((i) => i.productId === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      });
      setStorageItem("luxury_products", updated);
      return { products: updated };
    }),
  resetProducts: () => {
    setStorageItem("luxury_products", INITIAL_PRODUCTS);
    set({ products: INITIAL_PRODUCTS });
  },
}));
