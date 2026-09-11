import { create } from "zustand";
import { Bill, BillItem, PaymentMethod, BillTemplateId, MeasurementUnit } from "@/types/bill";
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
  paidAmountInput: number | null;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartItemPrice: (productId: string, price: number) => void;
  updateCartItemDiscount: (productId: string, discount: number, discountType: 'percentage' | 'fixed') => void;
  updateCartItemTaxRate: (productId: string, taxRate: number) => void;
  updateCartItemMeasurement: (productId: string, value: number | undefined, unit: MeasurementUnit) => void;
  applyGlobalGstRate: (taxRate: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Customer & Payment
  setCustomer: (id: string, name: string, phone: string) => void;
  setOrderDiscount: (percent: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setPaidAmountInput: (amount: number | null) => void;
  
  // Create & Manage Invoice
  saveCurrentBill: (templateId?: BillTemplateId) => Bill | null;
  createReturnBill: (params: {
    originalBill: Bill;
    returnedItems: BillItem[];
    adjustmentMode: 'ADJUST_DUE' | 'CASH_REFUND' | 'STORE_CREDIT';
    returnReason: string;
    returnTotal: number;
    adjustDuesAmount: number;
    cashRefundAmount: number;
    storeCreditAmount: number;
  }) => Bill | null;
  cancelBill: (billId: string) => Bill | null;
  recordBillPayment: (invoiceNo: string, amount: number) => void;
  importBackupBills: (newBills: Bill[]) => void;
  clearBills: () => void;
  resetBills: () => void;
}

const getInitialBills = (): Bill[] => {
  const stored = getStorageItem<Bill[]>("rajdhani_bills", INITIAL_BILLS);
  if (Array.isArray(stored)) {
    // Filter out all 310 demo bills (bill-1 to bill-310)
    const cleaned = stored.filter((b) => !b.id.match(/^bill-\d{1,3}$/));
    if (cleaned.length !== stored.length) {
      setStorageItem("rajdhani_bills", cleaned);
    }
    return cleaned;
  }
  return [];
};

export const useBillingStore = create<BillingStore>((set, get) => ({
  bills: getInitialBills(),
  cart: [],
  selectedCustomerId: "",
  selectedCustomerName: "",
  selectedCustomerPhone: "",
  orderDiscountPercent: 0,
  paymentMethod: "UPI",
  paidAmountInput: null,

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
      const safeQty = Math.max(0, quantity);
      const updatedCart = state.cart.map((item) => {
        if (item.productId === productId) {
          const itemSubtotal = item.price * safeQty;
          let discAmount = 0;
          if (item.discount > 0) {
            discAmount = item.discountType === "percentage" ? (itemSubtotal * item.discount) / 100 : item.discount;
          }
          const afterDisc = Math.max(0, itemSubtotal - discAmount);
          const taxAmount = (afterDisc * item.taxRate) / 100;
          return {
            ...item,
            quantity: safeQty,
            taxAmount,
            total: afterDisc + taxAmount,
          };
        }
        return item;
      });
      return { cart: updatedCart };
    }),

  updateCartItemPrice: (productId, price) =>
    set((state) => {
      const updatedCart = state.cart.map((item) => {
        if (item.productId === productId) {
          const itemSubtotal = price * item.quantity;
          let discAmount = 0;
          if (item.discount > 0) {
            discAmount = item.discountType === "percentage" ? (itemSubtotal * item.discount) / 100 : item.discount;
          }
          const afterDisc = itemSubtotal - discAmount;
          const taxAmount = (afterDisc * item.taxRate) / 100;
          return {
            ...item,
            price,
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

  updateCartItemTaxRate: (productId, taxRate) =>
    set((state) => {
      const safeRate = Math.max(0, taxRate);
      const updatedCart = state.cart.map((item) => {
        if (item.productId === productId) {
          const itemSubtotal = item.price * item.quantity;
          let discAmount = 0;
          if (item.discount > 0) {
            discAmount = item.discountType === "percentage" ? (itemSubtotal * item.discount) / 100 : item.discount;
          }
          const afterDisc = Math.max(0, itemSubtotal - discAmount);
          const taxAmount = (afterDisc * safeRate) / 100;
          return {
            ...item,
            taxRate: safeRate,
            taxAmount,
            total: afterDisc + taxAmount,
          };
        }
        return item;
      });
      return { cart: updatedCart };
    }),

  updateCartItemMeasurement: (productId, value, unit) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.productId === productId
          ? { ...item, measurementValue: value, measurementUnit: unit }
          : item
      ),
    })),

  applyGlobalGstRate: (taxRate) =>
    set((state) => {
      const safeRate = Math.max(0, taxRate);
      const updatedCart = state.cart.map((item) => {
        const itemSubtotal = item.price * item.quantity;
        let discAmount = 0;
        if (item.discount > 0) {
          discAmount = item.discountType === "percentage" ? (itemSubtotal * item.discount) / 100 : item.discount;
        }
        const afterDisc = Math.max(0, itemSubtotal - discAmount);
        const taxAmount = (afterDisc * safeRate) / 100;
        return {
          ...item,
          taxRate: safeRate,
          taxAmount,
          total: afterDisc + taxAmount,
        };
      });
      return { cart: updatedCart };
    }),

  removeFromCart: (productId) =>
    set((state) => ({ cart: state.cart.filter((item) => item.productId !== productId) })),

  clearCart: () => set({ cart: [], orderDiscountPercent: 0, paidAmountInput: null }),

  setCustomer: (id, name, phone) =>
    set({ selectedCustomerId: id, selectedCustomerName: name, selectedCustomerPhone: phone }),

  setOrderDiscount: (percent) => set({ orderDiscountPercent: percent }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setPaidAmountInput: (amount) => set({ paidAmountInput: amount }),

  saveCurrentBill: (templateId = "thermal80") => {
    const { cart, selectedCustomerId, selectedCustomerName, selectedCustomerPhone, orderDiscountPercent, paymentMethod, paidAmountInput, bills } = get();
    if (cart.length === 0) return null;

    const effectivePaid =
      paidAmountInput !== null && paidAmountInput !== undefined
        ? paidAmountInput
        : paymentMethod === "CREDIT"
        ? 0
        : undefined;

    const calculation = calculateInvoice(cart, orderDiscountPercent, effectivePaid);
    
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
      customerId: selectedCustomerId || "walkin",
      customerName: (selectedCustomerName && selectedCustomerName.trim()) ? selectedCustomerName.trim() : "Walk-in Customer",
      customerPhone: (selectedCustomerPhone && selectedCustomerPhone.trim()) ? selectedCustomerPhone.trim() : "",
      date: nowStr,
      items: [...cart],
      calculation,
      paymentMethod,
      paymentStatus: status,
      templateId: templateId as BillTemplateId,
      createdAt: nowStr,
    };

    const updatedBills = [newBill, ...bills];
    setStorageItem("rajdhani_bills", updatedBills);
    set({
      bills: updatedBills,
      cart: [],
      orderDiscountPercent: 0,
      paidAmountInput: null,
      selectedCustomerId: "",
      selectedCustomerName: "",
      selectedCustomerPhone: "",
    });
    return newBill;
  },

  createReturnBill: ({
    originalBill,
    returnedItems,
    adjustmentMode,
    returnReason,
    returnTotal,
    adjustDuesAmount,
    cashRefundAmount,
    storeCreditAmount,
  }) => {
    const { bills } = get();
    if (!returnedItems || returnedItems.length === 0) return null;

    const returnCount = bills.filter((b) => b.isReturn).length + 1;
    const retInvNo = `RET-2026${String(returnCount).padStart(5, "0")}`;
    const nowStr = new Date().toISOString();

    let totalSubtotal = 0;
    let totalTax = 0;
    for (const item of returnedItems) {
      totalSubtotal += item.price * item.quantity;
      totalTax += item.taxAmount;
    }

    const returnBill: Bill = {
      id: `ret-${Date.now()}`,
      invoiceNo: retInvNo,
      isReturn: true,
      parentInvoiceNo: originalBill.invoiceNo,
      returnReason: returnReason || "Customer Item Return / Exchange",
      returnAdjustmentMode: adjustmentMode,
      originalGrandTotal: originalBill.calculation.grandTotal,
      customerId: originalBill.customerId,
      customerName: originalBill.customerName,
      customerPhone: originalBill.customerPhone,
      customerGstin: originalBill.customerGstin,
      date: nowStr,
      items: returnedItems,
      calculation: {
        subtotal: totalSubtotal,
        itemDiscounts: 0,
        orderDiscount: 0,
        taxableAmount: totalSubtotal,
        cgst: Math.round((totalTax / 2) * 100) / 100,
        sgst: Math.round((totalTax / 2) * 100) / 100,
        igst: 0,
        totalTax: Math.round(totalTax * 100) / 100,
        grandTotal: returnTotal,
        paidAmount: cashRefundAmount,
        dueAmount: 0,
      },
      paymentMethod: adjustmentMode === "CASH_REFUND" ? "CASH" : "CREDIT",
      paymentStatus: "PAID",
      templateId: originalBill.templateId || "thermal80",
      notes: `Sales Return Credit Note for ${originalBill.invoiceNo}. Reason: ${returnReason || "Item Return"}`,
      createdAt: nowStr,
    };

    // If dues were adjusted on original bill, update original bill's due amount
    const updatedBills = bills.map((b) => {
      if (b.invoiceNo === originalBill.invoiceNo && adjustDuesAmount > 0) {
        const currentDue = b.calculation.dueAmount || 0;
        const newDue = Math.max(0, currentDue - adjustDuesAmount);
        const newStatus: "PAID" | "PARTIAL" | "DUE" = newDue <= 0 ? "PAID" : "PARTIAL";
        return {
          ...b,
          paymentStatus: newStatus,
          calculation: {
            ...b.calculation,
            dueAmount: newDue,
          },
        };
      }
      return b;
    });

    const finalBills = [returnBill, ...updatedBills];
    setStorageItem("rajdhani_bills", finalBills);
    set({ bills: finalBills });
    return returnBill;
  },

  cancelBill: (billId) => {
    const { bills } = get();
    const targetBill = bills.find((b) => b.id === billId || b.invoiceNo === billId);
    if (!targetBill || targetBill.paymentStatus === "CANCELLED") return null;

    const updatedBills = bills.map((b) =>
      b.id === targetBill.id ? { ...b, paymentStatus: "CANCELLED" as const } : b
    );

    setStorageItem("rajdhani_bills", updatedBills);
    set({ bills: updatedBills });
    return targetBill;
  },

  recordBillPayment: (invoiceNo, amount) => {
    const { bills } = get();
    const updatedBills = bills.map((b) => {
      if (b.invoiceNo === invoiceNo) {
        const currentPaid = b.calculation?.paidAmount || 0;
        const grandTotal = b.calculation?.grandTotal || 0;
        const newPaid = currentPaid + amount;
        const newDue = Math.max(0, grandTotal - newPaid);
        const newStatus: "PAID" | "PARTIAL" | "DUE" = newDue <= 0 ? "PAID" : "PARTIAL";
        return {
          ...b,
          paymentStatus: newStatus,
          calculation: {
            ...b.calculation,
            paidAmount: newPaid,
            dueAmount: newDue,
          },
        };
      }
      return b;
    });

    setStorageItem("rajdhani_bills", updatedBills);
    set({ bills: updatedBills });
  },

  importBackupBills: (newBills) => {
    setStorageItem("rajdhani_bills", newBills);
    set({ bills: newBills });
  },

  clearBills: () => {
    setStorageItem("rajdhani_bills", []);
    set({ bills: [], cart: [], orderDiscountPercent: 0, paidAmountInput: null });
  },

  resetBills: () => {
    setStorageItem("rajdhani_bills", []);
    set({ bills: [], cart: [], orderDiscountPercent: 0, paidAmountInput: null });
  },
}));
