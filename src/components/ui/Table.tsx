import React from "react";
import { cn } from "@/lib/utils";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gold-500/15 bg-obsidian-900/40">
      <table className={cn("w-full text-left text-sm border-collapse", className)}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-obsidian-900/90 text-xs font-semibold text-gold-400 uppercase tracking-wider border-b border-gold-500/20">
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-gold-500/10 text-slate-200">{children}</tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <tr className={cn("hover:bg-obsidian-800/50 transition-colors", className)}>
    {children}
  </tr>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <td className={cn("px-4 py-3 whitespace-nowrap", className)}>{children}</td>
);
