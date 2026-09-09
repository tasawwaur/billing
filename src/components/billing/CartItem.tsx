"use client";

import React from "react";
import { BillItem } from "@/types/bill";
import { Plus, Minus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface CartItemProps {
  item: BillItem;
  onUpdateQty: (productId: string, quantity: number) => void;
  onUpdatePrice?: (productId: string, price: number) => void;
  onUpdateTaxRate?: (productId: string, taxRate: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItemRow: React.FC<CartItemProps> = ({
  item,
  onUpdateQty,
  onUpdatePrice,
  onUpdateTaxRate,
  onRemove,
}) => {
  return (
    <div className="p-2.5 rounded-xl bg-obsidian-900/90 border border-gold-500/10 hover:border-gold-500/30 transition-all text-xs space-y-2">
      {/* Top Row: Product Name, Total Amount & Remove Button */}
      <div className="flex items-center justify-between gap-2">
        <h6 className="font-bold text-slate-100 line-clamp-1 flex-1 text-xs">
          {item.productName}
        </h6>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-extrabold text-gold-300 font-mono text-sm">
            {formatCurrency(item.total)}
          </span>
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Remove item from cart"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Unit Price, GST % badge, and Quantity controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
          {/* Unit Price */}
          <div className="flex items-center gap-1 bg-obsidian-950 px-1.5 py-0.5 rounded border border-gold-500/20 text-slate-200">
            <span className="text-gold-400 font-bold">₹</span>
            <input
              type="number"
              min="0"
              step="any"
              value={item.price ?? ""}
              placeholder="Price"
              onFocus={(e) => e.target.select()}
              onChange={(e) => onUpdatePrice?.(item.productId, Number(e.target.value) || 0)}
              className="w-14 bg-transparent text-xs font-bold text-slate-100 focus:outline-none focus:text-gold-300"
              title="Set or change unit price"
            />
            <span className="text-[10px] text-slate-400">/{item.unit}</span>
          </div>

          {/* GST % Adjuster */}
          <div
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-colors ${
              item.taxRate === 0
                ? "bg-slate-900/90 border-slate-700 text-slate-400"
                : "bg-cyan-950/40 border-cyan-500/30 text-cyan-200"
            }`}
            title="Click to change GST % for this item"
          >
            <span className="text-[9px] font-bold text-cyan-400">GST:</span>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              value={item.taxRate ?? 0}
              placeholder="0"
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                if (!isNaN(val)) {
                  onUpdateTaxRate?.(item.productId, Math.max(0, val));
                }
              }}
              className="w-7 bg-transparent text-xs font-extrabold text-center text-cyan-300 focus:outline-none focus:text-cyan-100"
            />
            <span className="text-[9px] text-cyan-400/80 font-bold">%</span>
          </div>
        </div>

        {/* Quantity Controls - Direct Type or Click +/- */}
        <div className="flex items-center gap-0.5 bg-obsidian-950 rounded-lg p-0.5 border border-gold-500/20 ml-auto">
          <button
            type="button"
            onClick={() => onUpdateQty(item.productId, Math.max(1, item.quantity - 1))}
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-obsidian-900 transition-colors"
            title="Minus 1"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <input
            type="number"
            min="1"
            value={item.quantity === 0 ? "" : item.quantity}
            placeholder="Qty"
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const val = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
              if (!isNaN(val)) {
                onUpdateQty(item.productId, val);
              }
            }}
            onBlur={() => {
              if (!item.quantity || item.quantity < 1) {
                onUpdateQty(item.productId, 1);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="w-12 text-center font-mono font-extrabold text-xs text-gold-300 bg-obsidian-900/90 rounded border border-gold-500/30 py-1 px-1 focus:outline-none focus:border-gold-400"
            title="Click to type quantity directly"
          />
          <button
            type="button"
            onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
            className="p-1.5 rounded text-slate-400 hover:text-gold-400 hover:bg-obsidian-900 transition-colors"
            title="Plus 1"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
