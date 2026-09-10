import { create } from "zustand";
import { LedgerEntry } from "@/types/ledger";
import { PaymentRecord } from "@/types/payment";
import { INITIAL_LEDGER, INITIAL_PAYMENTS } from "@/data/demo-transactions";
import { getStorageItem, setStorageItem } from "@/lib/storage";

interface LedgerStore {
  ledger: LedgerEntry[];
  payments: PaymentRecord[];
  addLedgerEntry: (entry: Omit<LedgerEntry, "id" | "date">) => void;
  addPaymentRecord: (payment: Omit<PaymentRecord, "id" | "date" | "status" | "createdAt"> & { status?: PaymentRecord["status"]; id?: string }) => void;
  updatePendingDueRecord: (invoiceNo: string, newDueAmount: number) => void;
  reversePaymentRecord: (paymentId: string) => PaymentRecord | null;
  clearPayments: () => void;
  importBackupLedger: (newLedger: LedgerEntry[], newPayments?: PaymentRecord[]) => void;
  resetLedger: () => void;
}

const getInitialPayments = (): PaymentRecord[] => {
  const stored = getStorageItem<PaymentRecord[]>("rajdhani_payments", INITIAL_PAYMENTS);
  if (Array.isArray(stored)) {
    const cleaned = stored.filter((p) => !["pay-1", "pay-2", "pay-3", "pay-4", "pay-5"].includes(p.id));
    const unique: PaymentRecord[] = [];
    const seenRefs = new Set<string>();
    const seenIds = new Set<string>();

    for (const p of cleaned) {
      if (
        p.referenceNo &&
        (p.referenceNo.startsWith("POS-") || p.referenceNo.startsWith("DUE-") || p.referenceNo.startsWith("REC-"))
      ) {
        const key = `${p.invoiceNo}_${p.referenceNo}`;
        if (seenRefs.has(key)) continue;
        seenRefs.add(key);
      }
      let pId = p.id;
      if (seenIds.has(pId)) {
        pId = `${pId}-${Math.random().toString(36).substring(2, 6)}`;
      }
      seenIds.add(pId);
      unique.push({ ...p, id: pId });
    }

    if (unique.length !== stored.length) {
      setStorageItem("rajdhani_payments", unique);
    }
    return unique;
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
        id: `led-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: new Date().toISOString(),
      };
      const updated = [newEntry, ...state.ledger];
      setStorageItem("rajdhani_ledger", updated);
      return { ledger: updated };
    }),
  addPaymentRecord: (payment) =>
    set((state) => {
      const nowStr = new Date().toISOString();
      let updated = [...state.payments];

      if (
        payment.referenceNo &&
        (payment.referenceNo.startsWith("POS-") || payment.referenceNo.startsWith("DUE-") || payment.referenceNo.startsWith("REC-"))
      ) {
        const existingIndex = updated.findIndex(
          (p) => p.invoiceNo === payment.invoiceNo && p.referenceNo === payment.referenceNo
        );
        if (existingIndex !== -1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...payment,
            amount: payment.amount,
            status: payment.status || updated[existingIndex].status || "COMPLETED",
          };
          setStorageItem("rajdhani_payments", updated);
          return { payments: updated };
        }
      }

      const uniqueSuffix = Math.random().toString(36).substring(2, 7);
      const newPayment: PaymentRecord = {
        ...payment,
        id: payment.id || `pay-${Date.now()}-${uniqueSuffix}`,
        date: nowStr,
        status: payment.status || "COMPLETED",
        createdAt: nowStr,
      };
      updated = [newPayment, ...updated];
      setStorageItem("rajdhani_payments", updated);
      return { payments: updated };
    }),
  updatePendingDueRecord: (invoiceNo, newDueAmount) =>
    set((state) => {
      let updated = [...state.payments];
      const pendingIdx = updated.findIndex(
        (p) => p.invoiceNo === invoiceNo && p.status === "PENDING"
      );

      if (newDueAmount <= 0) {
        if (pendingIdx !== -1) {
          updated = updated.filter((_, idx) => idx !== pendingIdx);
        }
      } else {
        if (pendingIdx !== -1) {
          updated[pendingIdx] = {
            ...updated[pendingIdx],
            amount: newDueAmount,
          };
        }
      }

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
