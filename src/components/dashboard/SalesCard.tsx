import React from "react";
import { IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface SalesCardProps {
  salesToday: number;
  billsCountToday: number;
  onClick?: () => void;
}

export const SalesCard: React.FC<SalesCardProps> = ({ salesToday, billsCountToday, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="glass-panel glass-panel-hover rounded-2xl p-5 border border-gold-500/25 relative overflow-hidden cursor-pointer active:scale-98 transition-all group"
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-400">Today's Sales</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1 gold-gradient-text">
            {formatCurrency(salesToday)}
          </h3>
        </div>
        <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 group-hover:bg-gold-500/20 transition-colors">
          <IndianRupee className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-gold-500/10">
        <span className="text-slate-400">Total Invoices Today</span>
        <span className="font-bold text-slate-200">{billsCountToday} Bills →</span>
      </div>
    </div>
  );
};
