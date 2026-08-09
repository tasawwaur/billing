"use client";

import React, { useState } from "react";
import { Bill } from "@/types/bill";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { BillTemplateA4 } from "@/components/bills/BillTemplateA4";
import { CustomerAccountDrawer } from "@/components/customers/CustomerAccountDrawer";
import { useSettingsStore } from "@/store/settings-store";
import { useCustomerStore } from "@/store/customer-store";
import { formatCurrency, formatDate } from "@/lib/currency";
import { Customer } from "@/types/customer";
import { Eye, Printer, MessageCircle } from "lucide-react";
import { sendInvoiceWhatsApp } from "@/lib/whatsapp";

interface RecentBillsProps {
  bills: Bill[];
}

export const RecentBills: React.FC<RecentBillsProps> = ({ bills }) => {
  const { settings } = useSettingsStore();
  const { customers } = useCustomerStore();

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedCustAccount, setSelectedCustAccount] = useState<Customer | null>(null);

  const handleOpenCustomerAccount = (custName: string, custId: string) => {
    const matched = customers.find((c) => c.id === custId || c.name.toLowerCase() === custName.toLowerCase());
    if (matched) {
      setSelectedCustAccount(matched);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-gold-500/20">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-100 gold-gradient-text uppercase tracking-wider">
            Recent Invoices
          </h4>
          <p className="text-xs text-slate-400">Live transaction stream</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Invoice #</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Payment Mode</TableCell>
            <TableCell>Status</TableCell>
            <TableCell className="text-right">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.slice(0, 8).map((bill) => (
            <TableRow key={bill.id}>
              <TableCell>
                <button
                  onClick={() => setSelectedBill(bill)}
                  className="font-mono font-bold text-gold-400 hover:text-gold-300 hover:underline text-left cursor-pointer"
                >
                  {bill.invoiceNo}
                </button>
              </TableCell>
              <TableCell>
                <button
                  onClick={() => handleOpenCustomerAccount(bill.customerName, bill.customerId)}
                  className="font-semibold text-slate-100 hover:text-gold-400 hover:underline cursor-pointer text-left"
                >
                  {bill.customerName}
                </button>
              </TableCell>
              <TableCell className="text-xs text-slate-400">{formatDate(bill.date)}</TableCell>
              <TableCell className="font-bold text-slate-100">
                {formatCurrency(bill.calculation.grandTotal)}
              </TableCell>
              <TableCell className="text-xs text-slate-300">{bill.paymentMethod}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    bill.paymentStatus === "PAID"
                      ? "paid"
                      : bill.paymentStatus === "DUE"
                      ? "due"
                      : "partial"
                  }
                >
                  {bill.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBill(bill)}
                  icon={<Eye className="w-3.5 h-3.5" />}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Invoice Detail Modal */}
      {selectedBill && (
        <Modal
          isOpen={!!selectedBill}
          onClose={() => setSelectedBill(null)}
          title={`Tax Invoice - ${selectedBill.invoiceNo}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => sendInvoiceWhatsApp(selectedBill, settings)}
                icon={<MessageCircle className="w-4 h-4 text-emerald-400" />}
              >
                Send PDF on WhatsApp
              </Button>
              <Button variant="gold" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                Print Invoice
              </Button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200">
              <BillTemplateA4 bill={selectedBill} settings={settings} />
            </div>
          </div>
        </Modal>
      )}

      {/* Customer Account Drawer */}
      {selectedCustAccount && (
        <CustomerAccountDrawer
          customer={selectedCustAccount}
          isOpen={!!selectedCustAccount}
          onClose={() => setSelectedCustAccount(null)}
        />
      )}
    </div>
  );
};
