import { create } from "zustand";
import { LedgerEntry } from "@/types/ledger";
import { PaymentRecord } from "@/types/payment";
import { INITIAL_LEDGER, INITIAL_PAYMENTS } from "@/data/demo-transactions";
import { getStorageItem, setStorageItem } from "@/lib/storage";

interface LedgerStore {
  ledger: LedgerEntry[];
  payments: PaymentRecord[];
  addLedgerEntry: (entry: Omit<LedgerEntry, "id" | "date">) => void;
  addPaymentRecord: (payment: Omit<PaymentRecord, "id" | "date" | "status" | "createdAt"> & { status?: PaymentRecord["status"] }) => void;
  reversePaymentRecord: (paymentId: string) => PaymentRecord | null;
  resetLedger: () => void;
}

export const useLedgerStore = create<LedgerStore>((set, get) => ({
  ledger: getStorageItem<LedgerEntry[]>("luxury_ledger", INITIAL_LEDGER),
  payments: getStorageItem<PaymentRecord[]>("luxury_payments", INITIAL_PAYMENTS),
  addLedgerEntry: (entry) =>
    set((state) => {
      const newEntry: LedgerEntry = {
        ...entry,
        id: `led-${Date.now()}`,
        date: new Date().toISOString(),
      };
      const updated = [newEntry, ...state.ledger];
      setStorageItem("luxury_ledger", updated);
      return { ledger: updated };
    }),
  addPaymentRecord: (payment) =>
    set((state) => {
      const nowStr = new Date().toISOString();
      const newPayment: PaymentRecord = {
        ...payment,
        id: `pay-${Date.now()}`,
        date: nowStr,
        status: payment.status || "COMPLETED",
        createdAt: nowStr,
      };
      const updated = [newPayment, ...state.payments];
      setStorageItem("luxury_payments", updated);
      return { payments: updated };
    }),
  reversePaymentRecord: (paymentId) => {
    const { payments } = get();
    const target = payments.find((p) => p.id === paymentId);
    if (!target || target.status === "REFUNDED") return null;

    const updated = payments.map((p) =>
      p.id === paymentId ? { ...p, status: "REFUNDED" as const } : p
    );

    setStorageItem("luxury_payments", updated);
    set({ payments: updated });
    return target;
  },
  resetLedger: () => {
    setStorageItem("luxury_ledger", INITIAL_LEDGER);
    setStorageItem("luxury_payments", INITIAL_PAYMENTS);
    set({ ledger: INITIAL_LEDGER, payments: INITIAL_PAYMENTS });
  },
}));
