"use client";

import React from "react";
import { Tag } from "lucide-react";

interface DiscountInputProps {
  orderDiscountPercent: number;
  onChangeDiscount: (percent: number) => void;
}

export const DiscountInput: React.FC<DiscountInputProps> = ({
  orderDiscountPercent,
  onChangeDiscount,
}) => {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-900/60 border border-gold-500/15 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-slate-300">
        <Tag className="w-3.5 h-3.5 text-gold-400" />
        <span>Order Discount (%)</span>
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          max="100"
          value={orderDiscountPercent || ""}
          onChange={(e) => onChangeDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
          placeholder="0"
          className="w-16 bg-obsidian-950 border border-gold-500/20 text-slate-100 font-bold text-center rounded px-2 py-1 focus:outline-none focus:border-gold-500"
        />
        <span className="text-slate-400 font-bold">%</span>
      </div>
    </div>
  );
};
