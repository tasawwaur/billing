"use client";

import React from "react";
import { BillCalculation } from "@/types/bill";
import { formatCurrency } from "@/lib/currency";
import { Clock, CheckCircle2 } from "lucide-react";

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
      <div className="flex justify-between items-center">
        <span className="text-slate-400">
          GST (Tax):
          {calculation.totalTax > 0 ? (
            <span className="text-[10px] text-cyan-300 font-mono ml-1.5">
              (CGST {formatCurrency(calculation.cgst)} + SGST {formatCurrency(calculation.sgst)})
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 ml-1.5">(0% - Bina GST)</span>
          )}
        </span>
        <span className={calculation.totalTax > 0 ? "font-bold text-cyan-300" : "text-slate-400"}>
          {formatCurrency(calculation.totalTax)}
        </span>
      </div>
      
      {/* Grand Total */}
      <div className="flex justify-between pt-2 border-t border-gold-500/20 text-sm font-extrabold text-slate-100">
        <span className="gold-gradient-text">Grand Total</span>
        <span className="text-lg font-extrabold text-gold-300">{formatCurrency(calculation.grandTotal)}</span>
      </div>

      {/* Paid Amount */}
      <div className="flex justify-between pt-1 border-t border-gold-500/10 text-slate-300 font-semibold">
        <span>Paid Amount (Praapt Rashi)</span>
        <span className="font-bold text-emerald-400">{formatCurrency(calculation.paidAmount)}</span>
      </div>

      {/* Shesh Baaki / Remaining Due */}
      {calculation.dueAmount > 0 ? (
        <div className="flex justify-between items-center p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold mt-1 shadow-sm">
          <span className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            Shesh Baaki (Balance Due):
          </span>
          <span className="text-sm font-extrabold text-rose-400 font-mono">
            {formatCurrency(calculation.dueAmount)}
          </span>
        </div>
      ) : (
        <div className="flex justify-between items-center p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold mt-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Status: Pura Bhugtan Ho Gaya
          </span>
          <span className="font-bold">Shesh: ₹0</span>
        </div>
      )}
    </div>
  );
};
