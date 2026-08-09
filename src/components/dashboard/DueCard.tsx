import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface DueCardProps {
  lowStockCount: number;
  onClick?: () => void;
}

export const DueCard: React.FC<DueCardProps> = ({ lowStockCount, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="glass-panel glass-panel-hover rounded-2xl p-5 border border-gold-500/25 flex flex-col justify-between cursor-pointer active:scale-98 transition-all group"
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Inventory Status</span>
          <h3 className="text-2xl font-extrabold text-amber-300 mt-1">{lowStockCount} Low Stock</h3>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-gold-500/10 text-slate-300">
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Stock Health
        </span>
        <span className="font-bold text-emerald-400">Reorder Alert →</span>
      </div>
    </div>
  );
};
