"use client";

import React, { useMemo } from "react";
import { useBillingStore } from "@/store/billing-store";
import { formatCurrency } from "@/lib/currency";

export const SalesChart: React.FC = () => {
  const { bills } = useBillingStore();

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const { chartData, weeklyTotal, maxSales } = useMemo(() => {
    const now = new Date();
    const data: { day: string; sales: number }[] = [];
    let total = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = i === 0 ? "Today" : days[d.getDay()];

      const daySales = bills
        .filter((b) => b.date.startsWith(dateStr) && b.paymentStatus !== "CANCELLED")
        .reduce((sum, b) => sum + b.calculation.grandTotal, 0);

      data.push({ day: dayName, sales: daySales });
      total += daySales;
    }

    const max = Math.max(...data.map((d) => d.sales), 1000);
    return { chartData: data, weeklyTotal: total, maxSales: max };
  }, [bills]);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-gold-500/20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-sm font-bold text-slate-100 gold-gradient-text uppercase tracking-wider">
            Sales Performance (7-Day Trend)
          </h4>
          <p className="text-xs text-slate-400">Real-time weekly revenue breakdown</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gold-500/10 text-gold-400 border border-gold-500/20">
          Weekly Total: {formatCurrency(weeklyTotal)}
        </span>
      </div>

      <div className="h-44 flex items-end gap-3 sm:gap-6 pt-4 px-2">
        {chartData.map((item, idx) => {
          const heightPercent = item.sales > 0 ? Math.max((item.sales / maxSales) * 100, 8) : 4;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="text-[10px] font-mono text-gold-300 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.sales > 0 ? formatCurrency(item.sales) : "₹0"}
              </div>
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[36px] rounded-t-lg transition-all duration-500 group-hover:brightness-125 shadow-gold ${
                  item.sales > 0
                    ? "bg-gradient-to-t from-gold-600 via-gold-400 to-amber-300"
                    : "bg-obsidian-800/80 border-t border-gold-500/20"
                }`}
              />
              <span className="text-[11px] font-medium text-slate-400 group-hover:text-gold-300">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
