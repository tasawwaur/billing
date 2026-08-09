"use client";

import React from "react";
import { BillItem } from "@/types/bill";
import { CartItemRow } from "./CartItem";
import { ShoppingBag, Trash2 } from "lucide-react";

interface CartProps {
  items: BillItem[];
  onUpdateQty: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClearCart: () => void;
}

export const Cart: React.FC<CartProps> = ({
  items,
  onUpdateQty,
  onRemove,
  onClearCart,
}) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gold-500/20 rounded-2xl bg-obsidian-900/30 min-h-[200px]">
        <div className="p-4 rounded-full bg-gold-500/10 text-gold-400 mb-2">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <p className="text-sm font-bold text-slate-200">POS Cart is Empty</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Select luxury items from catalog to generate tax invoice
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-slate-300">
          Selected Cart Items ({items.length})
        </span>
        <button
          onClick={onClearCart}
          className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> Clear Cart
        </button>
      </div>
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {items.map((item) => (
          <CartItemRow
            key={item.productId}
            item={item}
            onUpdateQty={onUpdateQty}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};
