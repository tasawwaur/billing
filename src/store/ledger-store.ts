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
  clearPayments: () => void;
  importBackupLedger: (newLedger: LedgerEntry[], newPayments?: PaymentRecord[]) => void;
  resetLedger: () => void;
}

const getInitialPayments = (): PaymentRecord[] => {
  const stored = getStorageItem<PaymentRecord[]>("rajdhani_payments", INITIAL_PAYMENTS);
  if (Array.isArray(stored)) {
    const cleaned = stored.filter((p) => !["pay-1", "pay-2", "pay-3", "pay-4", "pay-5"].includes(p.id));
    if (cleaned.length !== stored.length) {
      setStorageItem("rajdhani_payments", cleaned);
    }
    return cleaned;
  }
  return [];
};

const getInitialLedger = (): LedgerEntry[] => {
  const stored = getStorageItem<LedgerEntry[]>("rajdhani_ledger", INITIAL_LEDGER);
  if (Array.isArray(stored)) {
    const cleaned = stored.filter((l) => !["led-1", "led-2", "led-3", "led-4", "led-5", "led-6"].includes(l.id));
    if (cleaned.length !== stored.length) {
      setStorageItem("rajdhani_ledger", cleaned);
    }
    return cleaned;
  }
  return [];
};

export const useLedgerStore = create<LedgerStore>((set, get) => ({
  ledger: getInitialLedger(),
  payments: getInitialPayments(),
  addLedgerEntry: (entry) =>
    set((state) => {
      const newEntry: LedgerEntry = {
        ...entry,
        id: `led-${Date.now()}`,
        date: new Date().toISOString(),
      };
      const updated = [newEntry, ...state.ledger];
      setStorageItem("rajdhani_ledger", updated);
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
      setStorageItem("rajdhani_payments", updated);
      return { payments: updated };
    }),
  reversePaymentRecord: (paymentId) => {
    const { payments } = get();
    const target = payments.find((p) => p.id === paymentId);
    if (!target || target.status === "REFUNDED") return null;

    const updated = payments.map((p) =>
      p.id === paymentId ? { ...p, status: "REFUNDED" as const } : p
    );

    setStorageItem("rajdhani_payments", updated);
    set({ payments: updated });
    return target;
  },
  clearPayments: () => {
    setStorageItem("rajdhani_payments", []);
    set({ payments: [] });
  },
  importBackupLedger: (newLedger, newPayments) => {
    setStorageItem("rajdhani_ledger", newLedger);
    if (newPayments) {
      setStorageItem("rajdhani_payments", newPayments);
      set({ ledger: newLedger, payments: newPayments });
    } else {
      set({ ledger: newLedger });
    }
  },
  resetLedger: () => {
    setStorageItem("rajdhani_ledger", INITIAL_LEDGER);
    setStorageItem("rajdhani_payments", INITIAL_PAYMENTS);
    set({ ledger: INITIAL_LEDGER, payments: INITIAL_PAYMENTS });
  },
}));
