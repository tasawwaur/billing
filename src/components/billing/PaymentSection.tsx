"use client";

import React from "react";
import { PaymentMethod } from "@/types/bill";
import { QrCode, Banknote, CreditCard, Clock } from "lucide-react";

interface PaymentSectionProps {
  paymentMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  paymentMethod,
  onSelectMethod,
}) => {
  const methods = [
    { id: "UPI" as PaymentMethod, label: "UPI / QR", icon: QrCode },
    { id: "CASH" as PaymentMethod, label: "Cash", icon: Banknote },
    { id: "CARD" as PaymentMethod, label: "Card", icon: CreditCard },
    { id: "CREDIT" as PaymentMethod, label: "Due / Khata", icon: Clock },
  ];

  return (
    <div className="space-y-2">
      <span className="text-xs font-bold text-slate-300">Payment Mode</span>
      <div className="grid grid-cols-4 gap-1.5">
        {methods.map((m) => {
          const Icon = m.icon;
          const isSelected = paymentMethod === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMethod(m.id)}
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
  );
};
