import React from "react";
import { Users, Package } from "lucide-react";

interface CustomerCardProps {
  totalCustomers: number;
  totalProducts: number;
  onClick?: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ totalCustomers, totalProducts, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="glass-panel glass-panel-hover rounded-2xl p-5 border border-gold-500/25 flex flex-col justify-between cursor-pointer active:scale-98 transition-all group"
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Directory Overview</span>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-1">{totalCustomers} Customers</h3>
        </div>
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
          <Users className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-gold-500/10 text-slate-300">
        <span className="flex items-center gap-1 text-slate-400">
          <Package className="w-3.5 h-3.5" /> Total Products
        </span>
        <span className="font-bold text-gold-400">{totalProducts} Items →</span>
      </div>
    </div>
  );
};
