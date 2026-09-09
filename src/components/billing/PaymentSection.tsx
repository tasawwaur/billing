"use client";

import React from "react";
import { PaymentMethod } from "@/types/bill";
import { QrCode, Banknote, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface PaymentSectionProps {
  paymentMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  grandTotal: number;
  paidAmountInput: number | null;
  onChangePaidAmount: (amount: number | null) => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  paymentMethod,
  onSelectMethod,
  grandTotal = 0,
  paidAmountInput,
  onChangePaidAmount,
}) => {
  const methods = [
    { id: "UPI" as PaymentMethod, label: "UPI / QR", icon: QrCode },
    { id: "CASH" as PaymentMethod, label: "Cash", icon: Banknote },
    { id: "CARD" as PaymentMethod, label: "Card", icon: CreditCard },
    { id: "CREDIT" as PaymentMethod, label: "Due / Khata", icon: Clock },
  ];

  const isCredit = paymentMethod === "CREDIT";

  // Effective paid amount:
  // If user typed/cut to 0 or any amount, honor it directly!
  // Only when paidAmountInput === null, default to grandTotal (or 0 if Credit mode)
  const currentPaid =
    paidAmountInput !== null && paidAmountInput !== undefined
      ? Math.max(0, paidAmountInput)
      : isCredit
      ? 0
      : grandTotal;

  const remainingDue = Math.max(0, grandTotal - currentPaid);
  const changeToReturn = Math.max(0, currentPaid - grandTotal);

  // Controlled display value for input
  const displayValue =
    paidAmountInput !== null && paidAmountInput !== undefined
      ? paidAmountInput
      : isCredit
      ? 0
      : grandTotal;

  return (
    <div className="space-y-3">
      {/* 1. Payment Mode Selector */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-300">Payment Mode</span>
        <div className="grid grid-cols-4 gap-1.5">
          {methods.map((m) => {
            const Icon = m.icon;
            const isSelected = paymentMethod === m.id;
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => {
                  onSelectMethod(m.id);
                  if (m.id === "CREDIT") {
                    onChangePaidAmount(0);
                  }
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-xs font-bold ${
                  isSelected
                    ? "bg-gold-500/20 border-gold-500 text-gold-300 shadow-gold"
                    : "bg-obsidian-900/80 border-gold-500/10 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[10px]">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Paid / Received Amount Input (Grahak Se Praapt Rashi) */}
      <div className="p-3 rounded-xl bg-obsidian-900/90 border border-gold-500/20 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-200">
            Received / Paid Amount (Praapt Rashi)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (paymentMethod === "CREDIT") onSelectMethod("CASH");
                onChangePaidAmount(grandTotal);
              }}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
            >
              Full Paid ({formatCurrency(grandTotal)})
            </button>
            <button
              type="button"
              onClick={() => {
                onChangePaidAmount(0);
              }}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-colors"
            >
              Full Due (₹0)
            </button>
          </div>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400 font-bold text-sm">₹</span>
          <input
            type="number"
            min="0"
            step="any"
            value={displayValue}
            placeholder="0"
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                // When user cuts (Ctrl+X), clears, or backspaces completely: immediately set 0!
                onChangePaidAmount(0);
              } else {
                const parsed = parseFloat(raw);
                onChangePaidAmount(isNaN(parsed) ? 0 : Math.max(0, parsed));
              }
            }}
            className="w-full bg-obsidian-950 border border-gold-500/30 text-gold-300 rounded-xl py-2 pl-7 pr-3 text-sm font-extrabold focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-all"
            title="Type received amount from customer. Clear, cut, or type 0 for full due."
          />
        </div>

        {/* Real-time remaining balance or change calculation */}
        {remainingDue > 0 ? (
          <div className="flex justify-between items-center p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Shesh Baaki (Remaining Due / Udhar):
            </span>
            <span className="text-sm font-extrabold text-rose-400 font-mono">
              {formatCurrency(remainingDue)}
            </span>
          </div>
        ) : changeToReturn > 0 ? (
          <div className="flex justify-between items-center p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <span>Customer Ko Wapas Dene Hain (Change):</span>
            <span className="text-sm font-extrabold text-amber-300 font-mono">
              {formatCurrency(changeToReturn)}
            </span>
          </div>
        ) : (
          <div className="flex justify-between items-center p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Full Payment Received (Pura Paisa Mil Gaya)
            </span>
            <span>Shesh Baaki: ₹0</span>
          </div>
        )}
      </div>
    </div>
  );
};
