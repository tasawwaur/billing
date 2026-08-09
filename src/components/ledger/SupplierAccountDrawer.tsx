"use client";

import React from "react";
import { LedgerEntry } from "@/types/ledger";
import { StoreSettings } from "@/types/store";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/currency";
import { X, Building, ArrowUpRight, DollarSign, Printer } from "lucide-react";

interface SupplierAccountDrawerProps {
  supplierName: string;
  entries: LedgerEntry[];
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onRecordSettlement: () => void;
}

export const SupplierAccountDrawer: React.FC<SupplierAccountDrawerProps> = ({
  supplierName,
  entries,
  settings,
  isOpen,
  onClose,
  onRecordSettlement,
}) => {
  if (!isOpen) return null;

  const supplierEntries = entries.filter(
    (e) => e.partyName.toLowerCase() === supplierName.toLowerCase() || e.partyId === supplierName
  );

  const totalPayable = supplierEntries.reduce((sum, e) => (e.type === "CREDIT" ? sum + e.amount : sum - e.amount), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-xl bg-obsidian-950 border-l border-gold-500/30 shadow-glass h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gold-500/20 bg-obsidian-900/60 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-400 block">
                Supplier & Vendor Khata
              </span>
              <h2 className="text-xl font-extrabold text-slate-100">{supplierName}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-gold-400 hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Card */}
          <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block">
                Outstanding Payable (Dena Hai)
              </span>
              <h3 className="text-3xl font-extrabold text-rose-300 mt-1">{formatCurrency(totalPayable)}</h3>
            </div>
            <Button
              variant="gold"
              size="sm"
              onClick={() => {
                onClose();
                onRecordSettlement();
              }}
              icon={<DollarSign className="w-4 h-4" />}
            >
              Pay Supplier
            </Button>
          </div>

          {/* Statement History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Khata Statement History</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Ref #</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell className="text-right">Amount</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierEntries.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs text-slate-400">{formatDate(item.date)}</TableCell>
                    <TableCell className="font-mono text-xs text-gold-400 font-bold">{item.referenceNo}</TableCell>
                    <TableCell className="text-xs text-slate-300">{item.description}</TableCell>
                    <TableCell>
                      <Badge variant={item.type === "CREDIT" ? "due" : "paid"}>{item.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-extrabold text-slate-100">
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gold-500/20 bg-obsidian-900/40 flex justify-between items-center text-xs">
          <span className="text-slate-400">Total Transactions: {supplierEntries.length}</span>
          <Button variant="secondary" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
            Print Statement
          </Button>
        </div>
      </div>
    </div>
  );
};
