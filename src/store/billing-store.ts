import { create } from "zustand";
import { Bill, BillItem, PaymentMethod, BillTemplateId } from "@/types/bill";
import { Product } from "@/types/product";
import { INITIAL_BILLS } from "@/data/demo-bills";
import { calculateInvoice } from "@/lib/invoice";
import { getStorageItem, setStorageItem } from "@/lib/storage";

interface CartItem extends BillItem {}

interface BillingStore {
  bills: Bill[];
  cart: CartItem[];
  selectedCustomerId: string;
  selectedCustomerName: string;
  selectedCustomerPhone: string;
  orderDiscountPercent: number;
  paymentMethod: PaymentMethod;
  paidAmountInput: number;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartItemDiscount: (productId: string, discount: number, discountType: 'percentage' | 'fixed') => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Customer & Payment
  setCustomer: (id: string, name: string, phone: string) => void;
  setOrderDiscount: (percent: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setPaidAmountInput: (amount: number) => void;
  
  // Create & Manage Invoice
  saveCurrentBill: (templateId?: BillTemplateId) => Bill | null;
  cancelBill: (billId: string) => Bill | null;
  importBackupBills: (newBills: Bill[]) => void;
  resetBills: () => void;
}

export const useBillingStore = create<BillingStore>((set, get) => ({
  bills: getStorageItem<Bill[]>("luxury_bills", INITIAL_BILLS),
  cart: [],
  selectedCustomerId: "cust-1",
  selectedCustomerName: "Rahul Sharma",
  selectedCustomerPhone: "+919876543210",
  orderDiscountPercent: 0,
  paymentMethod: "UPI",
  paidAmountInput: 0,

  addToCart: (product, quantity = 1) =>
    set((state) => {
      const existingIndex = state.cart.findIndex((item) => item.productId === product.id);
      if (existingIndex > -1) {
        const updatedCart = [...state.cart];
        const newQty = updatedCart[existingIndex].quantity + quantity;
        const itemSubtotal = product.price * newQty;
        const taxAmount = (itemSubtotal * product.taxRate) / 100;
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: newQty,
          taxAmount,
          total: itemSubtotal + taxAmount,
        };
        return { cart: updatedCart };
      } else {
        const itemSubtotal = product.price * quantity;
        const taxAmount = (itemSubtotal * product.taxRate) / 100;
        const newItem: CartItem = {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          price: product.price,
          quantity,
          unit: product.unit,
          discount: 0,
          discountType: "percentage",
          taxRate: product.taxRate,
          taxAmount,
          total: itemSubtotal + taxAmount,
        };
        return { cart: [...state.cart, newItem] };
      }
    }),

  updateCartQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { cart: state.cart.filter((item) => item.productId !== productId) };
      }
      const updatedCart = state.cart.map((item) => {
        if (item.productId === productId) {
          const itemSubtotal = item.price * quantity;
          let discAmount = 0;
          if (item.discount > 0) {
            discAmount = item.discountType === "percentage" ? (itemSubtotal * item.discount) / 100 : item.discount;
          }
          const afterDisc = itemSubtotal - discAmount;
          const taxAmount = (afterDisc * item.taxRate) / 100;
          return {
            ...item,
            quantity,
            taxAmount,
            total: afterDisc + taxAmount,
          };
        }
        return item;
      });
      return { cart: updatedCart };
    }),

  updateCartItemDiscount: (productId, discount, discountType) =>
    set((state) => {
      const updatedCart = state.cart.map((item) => {
        if (item.productId === productId) {
          const itemSubtotal = item.price * item.quantity;
          let discAmount = 0;
          if (discount > 0) {
            discAmount = discountType === "percentage" ? (itemSubtotal * discount) / 100 : discount;
          }
          const afterDisc = itemSubtotal - discAmount;
          const taxAmount = (afterDisc * item.taxRate) / 100;
          return {
            ...item,
            discount,
            discountType,
            taxAmount,
            total: afterDisc + taxAmount,
          };
        }
        return item;
      });
      return { cart: updatedCart };
    }),

  removeFromCart: (productId) =>
    set((state) => ({ cart: state.cart.filter((item) => item.productId !== productId) })),

  clearCart: () => set({ cart: [], orderDiscountPercent: 0, paidAmountInput: 0 }),

  setCustomer: (id, name, phone) =>
    set({ selectedCustomerId: id, selectedCustomerName: name, selectedCustomerPhone: phone }),

  setOrderDiscount: (percent) => set({ orderDiscountPercent: percent }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setPaidAmountInput: (amount) => set({ paidAmountInput: amount }),

  saveCurrentBill: (templateId = "luxury_gold") => {
    const { cart, selectedCustomerId, selectedCustomerName, selectedCustomerPhone, orderDiscountPercent, paymentMethod, paidAmountInput, bills } = get();
    if (cart.length === 0) return null;

    const calculation = calculateInvoice(cart, orderDiscountPercent, paymentMethod === "CREDIT" ? 0 : paidAmountInput || undefined);
    
    let status: "PAID" | "DUE" | "PARTIAL" = "PAID";
    if (paymentMethod === "CREDIT" || calculation.paidAmount === 0) {
      status = "DUE";
    } else if (calculation.dueAmount > 0) {
      status = "PARTIAL";
    }

    const nextInvNum = 202600000 + bills.length + 1;
    const invNoStr = `INV-${nextInvNum}`;
    const nowStr = new Date().toISOString();

    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      invoiceNo: invNoStr,
      customerId: selectedCustomerId,
      customerName: selectedCustomerName,
      customerPhone: selectedCustomerPhone,
      date: nowStr,
      items: [...cart],
      calculation,
      paymentMethod,
      paymentStatus: status,
      templateId: templateId as BillTemplateId,
      createdAt: nowStr,
    };

    const updatedBills = [newBill, ...bills];
    setStorageItem("luxury_bills", updatedBills);
    set({ bills: updatedBills, cart: [], orderDiscountPercent: 0, paidAmountInput: 0 });
    return newBill;
  },

  cancelBill: (billId) => {
    const { bills } = get();
    const targetBill = bills.find((b) => b.id === billId || b.invoiceNo === billId);
    if (!targetBill || targetBill.paymentStatus === "CANCELLED") return null;

    const updatedBills = bills.map((b) =>
      b.id === targetBill.id ? { ...b, paymentStatus: "CANCELLED" as const } : b
    );

    setStorageItem("luxury_bills", updatedBills);
    set({ bills: updatedBills });
    return targetBill;
  },

  importBackupBills: (newBills) => {
    setStorageItem("luxury_bills", newBills);
    set({ bills: newBills });
  },

  resetBills: () => {
    setStorageItem("luxury_bills", INITIAL_BILLS);
    set({ bills: INITIAL_BILLS, cart: [], orderDiscountPercent: 0, paidAmountInput: 0 });
  },
}));
