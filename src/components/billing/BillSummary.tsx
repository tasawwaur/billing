"use client";

import React from "react";
import { BillCalculation } from "@/types/bill";
import { formatCurrency } from "@/lib/currency";

interface BillSummaryProps {
  calculation: BillCalculation;
}

export const BillSummary: React.FC<BillSummaryProps> = ({ calculation }) => {
  return (
    <div className="glass-panel p-3.5 rounded-xl border border-gold-500/20 space-y-1.5 text-xs text-slate-300">
      <div className="flex justify-between">
        <span className="text-slate-400">Subtotal</span>
        <span className="font-semibold text-slate-200">{formatCurrency(calculation.subtotal)}</span>
      </div>
      {calculation.orderDiscount > 0 && (
        <div className="flex justify-between text-emerald-400">
          <span>Order Discount</span>
          <span>-{formatCurrency(calculation.orderDiscount)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-slate-400">Taxable Amount</span>
        <span>{formatCurrency(calculation.taxableAmount)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">GST (Total Tax)</span>
        <span>{formatCurrency(calculation.totalTax)}</span>
      </div>
      <div className="flex justify-between pt-2 border-t border-gold-500/20 text-sm font-extrabold text-slate-100">
        <span className="gold-gradient-text">Grand Total</span>
        <span className="text-lg font-extrabold text-gold-300">{formatCurrency(calculation.grandTotal)}</span>
      </div>
    </div>
  );
};
