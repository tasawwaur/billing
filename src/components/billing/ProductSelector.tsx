"use client";

import React, { useState, useMemo, useDeferredValue } from "react";
import { Product } from "@/types/product";
import { Search, Plus, Barcode } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface ProductSelectorProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  onSelectProduct,
}) => {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.barcode.includes(query);
      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, deferredSearch, selectedCategory]);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Search & Barcode Simulator */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Fast search catalog or scan barcode (e.g. 890123456001)..."
            className="w-full bg-obsidian-900/90 border border-gold-500/20 text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>
        <div className="p-2.5 bg-obsidian-900 border border-gold-500/20 rounded-xl text-gold-400 flex items-center justify-center">
          <Barcode className="w-5 h-5" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs font-semibold px-3 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-gold-500 text-obsidian-950 font-bold"
                : "bg-obsidian-900/80 text-slate-400 border border-gold-500/10 hover:text-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto max-h-[520px] pr-1">
        {filtered.map((prod) => {
          const isLowStock = prod.stock <= prod.minStockAlert;
          return (
            <button
              key={prod.id}
              onClick={() => onSelectProduct(prod)}
              disabled={prod.stock === 0}
              className={`flex flex-col justify-between p-3 rounded-xl border text-left transition-all ${
                prod.stock === 0
                  ? "bg-obsidian-950/40 border-slate-800 opacity-40 cursor-not-allowed"
                  : "glass-panel glass-panel-hover border-gold-500/15 hover:border-gold-500/40 cursor-pointer active:scale-95"
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-bold text-gold-400 uppercase tracking-wider">
                    {prod.category}
                  </span>
                  {isLowStock && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Low: {prod.stock}
                    </span>
                  )}
                </div>
                <h5 className="text-xs font-bold text-slate-100 line-clamp-2 mt-1">
                  {prod.name}
                </h5>
                <span className="text-[10px] text-slate-400 font-mono">{prod.sku}</span>
              </div>

              <div className="flex justify-between items-end mt-2 pt-2 border-t border-gold-500/10">
                <span className="text-sm font-extrabold text-gold-300">
                  {formatCurrency(prod.price)}
                </span>
                <div className="w-6 h-6 rounded-lg bg-gold-500/10 text-gold-400 flex items-center justify-center border border-gold-500/30">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
