import { create } from "zustand";
import { Customer } from "@/types/customer";
import { INITIAL_CUSTOMERS } from "@/data/demo-customers";
import { getStorageItem, setStorageItem } from "@/lib/storage";

interface CustomerStore {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, "id" | "totalBills" | "totalSpent" | "dueBalance" | "denaBalance" | "createdAt">) => Customer;
  updateCustomer: (id: string, updated: Partial<Customer>) => void;
  recordPurchase: (customerId: string, spentAmount: number, dueAmount: number) => void;
  recordPayment: (customerId: string, paidAmount: number) => void;
  recordDenaPayment: (customerId: string, paidAmount: number) => void;
  recordAddDena: (customerId: string, amount: number) => void;
  recordAddDue: (customerId: string, amount: number) => void;
  recordSalesReturn: (customerId: string, returnAmount: number, adjustDuesAmount: number, storeCreditAmount: number) => void;
  importBackupCustomers: (newCustomers: Customer[]) => void;
  clearCustomers: () => void;
  resetCustomers: () => void;
}

const getInitialCustomers = (): Customer[] => {
  const stored = getStorageItem<Customer[]>("rajdhani_customers", INITIAL_CUSTOMERS);
  if (Array.isArray(stored)) {
    // Keep only real user-added customers, strip out all 126 demo customers
    const cleaned = stored.filter((c) => !c.id.match(/^cust-\d{1,3}$/));
    if (cleaned.length !== stored.length) {
      setStorageItem("rajdhani_customers", cleaned);
    }
    return cleaned;
  }
  return [];
};

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: getInitialCustomers(),
  addCustomer: (c) => {
    const newCustomer: Customer = {
      ...c,
      id: `cust-${Date.now()}`,
      totalBills: 0,
      totalSpent: 0,
      dueBalance: 0,
      denaBalance: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    const updated = [newCustomer, ...get().customers];
    setStorageItem("rajdhani_customers", updated);
    set({ customers: updated });
    return newCustomer;
  },
  updateCustomer: (id, updatedFields) =>
    set((state) => {
      const updated = state.customers.map((c) =>
        c.id === id ? { ...c, ...updatedFields } : c
      );
      setStorageItem("rajdhani_customers", updated);
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
      setStorageItem("rajdhani_customers", updated);
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
      setStorageItem("rajdhani_customers", updated);
      return { customers: updated };
    }),
  recordDenaPayment: (customerId, paidAmount) =>
    set((state) => {
      const updated = state.customers.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            denaBalance: Math.max(0, (c.denaBalance || 0) - paidAmount),
          };
        }
        return c;
      });
      setStorageItem("rajdhani_customers", updated);
      return { customers: updated };
    }),
  recordAddDena: (customerId, amount) =>
    set((state) => {
      const updated = state.customers.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            denaBalance: (c.denaBalance || 0) + amount,
          };
        }
        return c;
      });
      setStorageItem("rajdhani_customers", updated);
      return { customers: updated };
    }),
  recordAddDue: (customerId, amount) =>
    set((state) => {
      const updated = state.customers.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            dueBalance: c.dueBalance + amount,
          };
        }
        return c;
      });
      setStorageItem("rajdhani_customers", updated);
      return { customers: updated };
    }),
  recordSalesReturn: (customerId, returnAmount, adjustDuesAmount, storeCreditAmount) =>
    set((state) => {
      const updated = state.customers.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            totalSpent: Math.max(0, c.totalSpent - returnAmount),
            dueBalance: Math.max(0, c.dueBalance - adjustDuesAmount),
            denaBalance: (c.denaBalance || 0) + storeCreditAmount,
          };
        }
        return c;
      });
      setStorageItem("rajdhani_customers", updated);
      return { customers: updated };
    }),
  importBackupCustomers: (newCustomers) => {
    setStorageItem("rajdhani_customers", newCustomers);
    set({ customers: newCustomers });
  },
  clearCustomers: () => {
    setStorageItem("rajdhani_customers", []);
    set({ customers: [] });
  },
  resetCustomers: () => {
    setStorageItem("rajdhani_customers", []);
    set({ customers: [] });
  },
}));
