import { create } from "zustand";
import { Customer } from "@/types/customer";
import { INITIAL_CUSTOMERS } from "@/data/demo-customers";
import { getStorageItem, setStorageItem } from "@/lib/storage";

interface CustomerStore {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, "id" | "totalBills" | "totalSpent" | "dueBalance" | "createdAt">) => Customer;
  updateCustomer: (id: string, updated: Partial<Customer>) => void;
  recordPurchase: (customerId: string, spentAmount: number, dueAmount: number) => void;
  recordPayment: (customerId: string, paidAmount: number) => void;
  resetCustomers: () => void;
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: getStorageItem<Customer[]>("luxury_customers", INITIAL_CUSTOMERS),
  addCustomer: (c) => {
    const newCustomer: Customer = {
      ...c,
      id: `cust-${Date.now()}`,
      totalBills: 0,
      totalSpent: 0,
      dueBalance: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    const updated = [newCustomer, ...get().customers];
    setStorageItem("luxury_customers", updated);
    set({ customers: updated });
    return newCustomer;
  },
  updateCustomer: (id, updatedFields) =>
    set((state) => {
      const updated = state.customers.map((c) =>
        c.id === id ? { ...c, ...updatedFields } : c
      );
      setStorageItem("luxury_customers", updated);
      return { customers: updated };
    }),
  recordPurchase: (customerId, spentAmount, dueAmount) =>
    set((state) => {
      const updated = state.customers.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            totalBills: c.totalBills + 1,
            totalSpent: c.totalSpent + spentAmount,
            dueBalance: c.dueBalance + dueAmount,
          };
        }
        return c;
      });
      setStorageItem("luxury_customers", updated);
      return { customers: updated };
    }),
  recordPayment: (customerId, paidAmount) =>
    set((state) => {
      const updated = state.customers.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            dueBalance: Math.max(0, c.dueBalance - paidAmount),
          };
        }
        return c;
      });
      setStorageItem("luxury_customers", updated);
      return { customers: updated };
    }),
  resetCustomers: () => {
    setStorageItem("luxury_customers", INITIAL_CUSTOMERS);
    set({ customers: INITIAL_CUSTOMERS });
  },
}));
