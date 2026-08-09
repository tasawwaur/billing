"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Package,
  Users,
  Palette,
  Images,
  BookOpen,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_ITEMS = [
  { label: "POS", path: "/billing", icon: Receipt },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Payments", path: "/payments", icon: CreditCard },
  { label: "Customers", path: "/customers", icon: Users },
  { label: "Ledger", path: "/ledger", icon: BookOpen },
  { label: "Products", path: "/products", icon: Package },
  { label: "Gallery", path: "/bill-gallery", icon: Images },
  { label: "Reports", path: "/reports", icon: BarChart3 },
];

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-obsidian-950/95 border-t border-gold-500/25 backdrop-blur-md flex items-center overflow-x-auto no-scrollbar py-2 px-2 gap-1">
      {MOBILE_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex flex-col items-center justify-center min-w-[58px] gap-1 py-1 px-1.5 rounded-xl text-[10px] font-semibold transition-all active:scale-95",
              isActive
                ? "bg-gold-500/15 text-gold-400 font-bold border border-gold-500/30"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Icon className={cn("w-4 h-4", isActive ? "text-gold-400" : "text-slate-400")} />
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
