import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "gold",
  size = "md",
  icon,
  className,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none";

  const variants = {
    gold: "gold-gradient-button",
    secondary: "bg-obsidian-800 text-slate-200 hover:bg-obsidian-700 border border-gold-500/20",
    outline: "border border-gold-500/40 text-gold-400 hover:bg-gold-500/10",
    danger: "bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30",
    ghost: "text-slate-300 hover:text-gold-400 hover:bg-obsidian-800/50",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-6 py-3 gap-2.5",
  };

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
