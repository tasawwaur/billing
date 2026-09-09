"use client";

import React from "react";
import { Percent, Check } from "lucide-react";

interface GstSelectorProps {
  cartTaxRates: number[];
  onApplyGlobalGst: (rate: number) => void;
}

const GST_PRESETS = [
  { rate: 5, label: "5%" },
  { rate: 9, label: "9%" },
  { rate: 15, label: "15%" },
  { rate: 18, label: "18%" },
  { rate: 28, label: "28%" },
];

export const GstSelector: React.FC<GstSelectorProps> = ({
  cartTaxRates,
  onApplyGlobalGst,
}) => {
  // Determine current active rate
  const allSameRate =
    cartTaxRates.length > 0 &&
    cartTaxRates.every((rate) => rate === cartTaxRates[0]);
  const activeRate = allSameRate ? cartTaxRates[0] : null;

  return (
    <div className="p-3 rounded-xl bg-obsidian-900/80 border border-gold-500/20 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <Percent className="w-3.5 h-3.5 text-gold-400" />
          <span>GST Rate</span>
        </div>
        <div className="text-[10px] font-semibold">
          {activeRate !== null ? (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Active: {activeRate}% GST
            </span>
          ) : cartTaxRates.length > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Mixed Rates in Cart
            </span>
          ) : null}
        </div>
      </div>

      {/* Exactly 5 Preset Chips: 5%, 9%, 15%, 18%, 28% */}
      <div className="grid grid-cols-5 gap-1.5 pt-0.5">
        {GST_PRESETS.map((preset) => {
          const isSelected = activeRate === preset.rate;
          return (
            <button
              key={preset.rate}
              type="button"
              onClick={() => onApplyGlobalGst(preset.rate)}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                isSelected
                  ? "bg-gradient-to-r from-gold-500/30 to-amber-500/30 text-gold-200 border-gold-400 shadow-sm ring-1 ring-gold-400/50"
                  : "bg-obsidian-950 text-slate-300 border-white/10 hover:border-gold-500/40 hover:text-white"
              }`}
            >
              {isSelected && <Check className="w-3 h-3 text-gold-400 flex-shrink-0" />}
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
