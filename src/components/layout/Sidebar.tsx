"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Package,
  Users,
  BookOpen,
  CreditCard,
  BarChart3,
  Palette,
  Images,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settings-store";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Billing", path: "/billing", icon: Receipt, isHighlight: true },
  { label: "Products", path: "/products", icon: Package },
  { label: "Customers", path: "/customers", icon: Users },
  { label: "Ledger", path: "/ledger", icon: BookOpen },
  { label: "Payments", path: "/payments", icon: CreditCard },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Bill Design", path: "/bill-design", icon: Palette, badge: "Studio" },
  { label: "Bill Gallery", path: "/bill-gallery", icon: Images, badge: "300+" },
  { label: "Settings", path: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { settings } = useSettingsStore();

  return (
    <aside className="w-64 bg-obsidian-950/90 border-r border-gold-500/20 flex flex-col justify-between hidden md:flex min-h-screen sticky top-0 z-30">
      <div>
        {/* Store Brand */}
        <div className="p-6 border-b border-gold-500/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 flex items-center justify-center text-obsidian-950 font-bold shadow-gold">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-wider text-slate-100 uppercase gold-gradient-text">
              {settings.storeName || "LUXURY STORE"}
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-gold-400/80 font-semibold">
              Billing POS System
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-gradient-to-r from-gold-500/20 to-gold-600/5 text-gold-300 border border-gold-500/30 shadow-gold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-obsidian-900/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-gold-400" : "text-slate-400 group-hover:text-gold-400"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-400 border border-gold-500/30">
                    {item.badge}
                  </span>
                )}
                {item.isHighlight && (
                  <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick POS Banner */}
      <div className="p-4 m-4 glass-panel rounded-xl border border-gold-500/25 text-center space-y-2">
        <p className="text-xs font-bold text-slate-200">Point of Sale Active</p>
        <p className="text-[10px] text-slate-400">Cash, UPI, Card & Khata Dues</p>
        <Link
          href="/billing"
          className="block w-full py-2 text-xs font-bold rounded-lg gold-gradient-button text-obsidian-950 text-center"
        >
          Open POS Screen
        </Link>
      </div>
    </aside>
  );
};
