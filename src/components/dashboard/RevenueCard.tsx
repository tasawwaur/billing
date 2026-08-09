import React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface RevenueCardProps {
  receivable: number;
  payable: number;
  onReceivableClick?: () => void;
  onPayableClick?: () => void;
  onClick?: () => void;
}

export const RevenueCard: React.FC<RevenueCardProps> = ({
  receivable,
  payable,
  onReceivableClick,
  onPayableClick,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="glass-panel glass-panel-hover rounded-2xl p-5 border border-gold-500/25 cursor-pointer transition-all"
    >
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ledger Balances</span>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onReceivableClick?.();
          }}
          className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Receivable</span>
          </div>
          <p className="text-lg font-bold text-emerald-300 mt-1">{formatCurrency(receivable)}</p>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onPayableClick?.();
          }}
          className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-400 uppercase">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Payable</span>
          </div>
          <p className="text-lg font-bold text-rose-300 mt-1">{formatCurrency(payable)}</p>
        </div>
      </div>
    </div>
  );
};
