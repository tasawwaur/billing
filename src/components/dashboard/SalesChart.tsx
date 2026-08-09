import React from "react";

export const SalesChart: React.FC = () => {
  const data = [
    { day: "Mon", sales: 34200 },
    { day: "Tue", sales: 28500 },
    { day: "Wed", sales: 41000 },
    { day: "Thu", sales: 36800 },
    { day: "Fri", sales: 52400 },
    { day: "Sat", sales: 68900 },
    { day: "Sun (Today)", sales: 48620 },
  ];

  const max = Math.max(...data.map((d) => d.sales));

  return (
    <div className="glass-panel rounded-2xl p-6 border border-gold-500/20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-sm font-bold text-slate-100 gold-gradient-text uppercase tracking-wider">
            Sales Performance (7-Day Trend)
          </h4>
          <p className="text-xs text-slate-400">Peak revenue weekend analytics</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gold-500/10 text-gold-400 border border-gold-500/20">
          Weekly Total: ₹3,10,420
        </span>
      </div>

      <div className="h-44 flex items-end gap-3 sm:gap-6 pt-4 px-2">
        {data.map((item, idx) => {
          const heightPercent = (item.sales / max) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="text-[10px] font-mono text-gold-300 opacity-0 group-hover:opacity-100 transition-opacity">
                ₹{(item.sales / 1000).toFixed(1)}k
              </div>
              <div
                style={{ height: `${heightPercent}%` }}
                className="w-full max-w-[36px] bg-gradient-to-t from-gold-600 via-gold-400 to-amber-300 rounded-t-lg transition-all duration-500 group-hover:brightness-125 shadow-gold"
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
