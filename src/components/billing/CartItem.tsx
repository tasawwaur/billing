"use client";

import React from "react";
import { BillItem } from "@/types/bill";
import { Plus, Minus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface CartItemProps {
  item: BillItem;
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItemRow: React.FC<CartItemProps> = ({ item, onUpdateQty, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-900/90 border border-gold-500/10 hover:border-gold-500/30 transition-all text-xs">
      <div className="flex-1 pr-2">
        <h6 className="font-bold text-slate-100 line-clamp-1">{item.productName}</h6>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
          <span>{formatCurrency(item.price)}/{item.unit}</span>
          <span>• GST {item.taxRate}%</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quantity Controls */}
        <div className="flex items-center gap-1 bg-obsidian-950 rounded-lg p-1 border border-gold-500/15">
          <button
            onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-obsidian-900"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-6 text-center font-mono font-bold text-slate-100">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
            className="p-1 rounded text-slate-400 hover:text-gold-400 hover:bg-obsidian-900"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Total & Remove */}
        <div className="text-right min-w-[70px]">
          <p className="font-extrabold text-gold-300">{formatCurrency(item.total)}</p>
        </div>

        <button
          onClick={() => onRemove(item.productId)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
