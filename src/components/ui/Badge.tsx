import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "paid" | "due" | "partial" | "gold" | "neutral";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "gold",
  className,
}) => {
  const variants = {
    paid: "badge-paid",
    due: "badge-due",
    partial: "badge-partial",
    gold: "bg-gold-500/10 text-gold-400 border border-gold-500/30",
    neutral: "bg-slate-800/60 text-slate-300 border border-slate-700/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full tracking-wide uppercase",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
