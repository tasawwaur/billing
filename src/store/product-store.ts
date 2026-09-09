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
  importBackupProducts: (newProducts: Product[]) => void;
  resetProducts: () => void;
}

const getInitialProducts = (): Product[] => {
  const stored = getStorageItem<Product[]>("rajdhani_products", INITIAL_PRODUCTS);
  if (Array.isArray(stored) && stored.length > 0) {
    let hasDiff = false;
    const migrated = stored.map((p) => {
      const canonical = INITIAL_PRODUCTS.find((init) => init.id === p.id);
      if (canonical && canonical.name !== p.name) {
        hasDiff = true;
        return { ...p, name: canonical.name };
      }
      return p;
    });
    if (hasDiff) {
      setStorageItem("rajdhani_products", migrated);
      return migrated;
    }
    return stored;
  }
  return INITIAL_PRODUCTS;
};

export const useProductStore = create<ProductStore>((set) => ({
  products: getInitialProducts(),
  addProduct: (prod) =>
    set((state) => {
      const newProduct: Product = {
        ...prod,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
      };
      const updated = [newProduct, ...state.products];
      setStorageItem("rajdhani_products", updated);
      return { products: updated };
    }),
  updateProduct: (id, updatedFields) =>
    set((state) => {
      const updated = state.products.map((p) =>
        p.id === id ? { ...p, ...updatedFields } : p
      );
      setStorageItem("rajdhani_products", updated);
      return { products: updated };
    }),
  deleteProduct: (id) =>
    set((state) => {
      const updated = state.products.filter((p) => p.id !== id);
      setStorageItem("rajdhani_products", updated);
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
      setStorageItem("rajdhani_products", updated);
      return { products: updated };
    }),
  importBackupProducts: (newProducts) => {
    setStorageItem("rajdhani_products", newProducts);
    set({ products: newProducts });
  },
  resetProducts: () => {
    setStorageItem("rajdhani_products", INITIAL_PRODUCTS);
    set({ products: INITIAL_PRODUCTS });
  },
}));
