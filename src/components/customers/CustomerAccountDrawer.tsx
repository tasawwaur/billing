"use client";

import React, { useState } from "react";
import { Customer } from "@/types/customer";
import { useBillingStore } from "@/store/billing-store";
import { useLedgerStore } from "@/store/ledger-store";
import { useCustomerStore } from "@/store/customer-store";
import { useSettingsStore } from "@/store/settings-store";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { BillTemplateA4 } from "@/components/bills/BillTemplateA4";
import { normalizeIndianMobile, sendInvoiceWhatsApp } from "@/lib/whatsapp";
import { formatCurrency, formatDate, formatTime } from "@/lib/currency";
import { Bill } from "@/types/bill";
import { useRouter } from "next/navigation";
import {
  X,
  Plus,
  DollarSign,
  Printer,
  FileText,
  ShoppingBag,
  CreditCard,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  MessageCircle,
} from "lucide-react";

interface CustomerAccountDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerAccountDrawer: React.FC<CustomerAccountDrawerProps> = ({
  customer,
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { bills, setCustomer } = useBillingStore();
  const { ledger, payments, addLedgerEntry, addPaymentRecord } = useLedgerStore();
  const { recordPayment } = useCustomerStore();
  const { settings } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<"purchases" | "payments" | "ledger">("purchases");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBillForPreview, setSelectedBillForPreview] = useState<Bill | null>(null);

  // Payment Form State
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<"CASH" | "UPI" | "CARD" | "BANK_TRANSFER">("UPI");
  const [payRef, setPayRef] = useState("");

  if (!isOpen || !customer) return null;

  const normalizedPhone = normalizeIndianMobile(customer.phone);
  const customerBills = bills.filter((b) => b.customerId === customer.id || b.customerPhone === customer.phone);
  const customerPayments = payments.filter((p) => p.customerId === customer.id || p.customerName === customer.name);
  const customerLedger = ledger.filter((l) => l.partyId === customer.id || l.partyName === customer.name);

  const totalPurchase = customer.totalSpent || customerBills.reduce((sum, b) => sum + b.calculation.grandTotal, 0);
  const totalPaid = customerPayments.reduce((sum, p) => sum + p.amount, 0) || Math.max(0, totalPurchase - customer.dueBalance);
  const lenaHai = customer.dueBalance;
  const denaHai = 0;
  const netBalance = lenaHai - denaHai;

  const handleNewBill = () => {
    setCustomer(customer.id, customer.name, customer.phone);
    onClose();
    router.push("/billing");
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || payAmount <= 0) return;

    recordPayment(customer.id, payAmount);
    
    addLedgerEntry({
      partyId: customer.id,
      partyName: customer.name,
      partyType: "CUSTOMER",
      type: "CREDIT",
      amount: payAmount,
      runningBalance: Math.max(0, lenaHai - payAmount),
      referenceNo: payRef || `PAY-${Date.now().toString().slice(-6)}`,
      description: `Payment received via ${payMethod}`,
    });

    addPaymentRecord({
      billId: customerBills[0]?.id || `bill-${Date.now()}`,
      invoiceNo: customerBills[0]?.invoiceNo || "DIRECT-REC",
      customerId: customer.id,
      customerName: customer.name,
      amount: payAmount,
      method: payMethod,
      referenceNo: payRef || `REC-${Date.now().toString().slice(-6)}`,
    });

    setShowPaymentModal(false);
    setPayAmount(0);
    setPayRef("");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-obsidian-950 border-l border-gold-500/30 shadow-glass h-full flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-gold-500/20 bg-obsidian-900/60 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-400">
              Customer Account Statement
            </span>
            <h2 className="text-2xl font-extrabold text-slate-100 uppercase gold-gradient-text">
              {customer.name}
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{normalizedPhone}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-gold-400 hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="glass-panel p-3 rounded-xl border border-gold-500/15">
              <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Total Purchase</span>
              <span className="text-sm font-extrabold text-slate-100 mt-1 block">{formatCurrency(totalPurchase)}</span>
            </div>
            <div className="glass-panel p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <span className="text-[9px] font-extrabold uppercase text-emerald-400 block">Total Paid</span>
              <span className="text-sm font-extrabold text-emerald-300 mt-1 block">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="glass-panel p-3 rounded-xl border border-rose-500/20 bg-rose-500/5">
              <span className="text-[9px] font-extrabold uppercase text-rose-400 block">Lena Hai</span>
              <span className="text-sm font-extrabold text-rose-300 mt-1 block">{formatCurrency(lenaHai)}</span>
            </div>
            <div className="glass-panel p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <span className="text-[9px] font-extrabold uppercase text-blue-400 block">Dena Hai</span>
              <span className="text-sm font-extrabold text-blue-300 mt-1 block">{formatCurrency(denaHai)}</span>
            </div>
            <div className="glass-panel p-3 rounded-xl border border-gold-500/20">
              <span className="text-[9px] font-extrabold uppercase text-gold-400 block">Net Balance</span>
              <span className="text-sm font-extrabold text-gold-300 mt-1 block">{formatCurrency(netBalance)}</span>
            </div>
            <div className="glass-panel p-3 rounded-xl border border-gold-500/15">
              <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Total Bills</span>
              <span className="text-sm font-extrabold text-slate-100 mt-1 block">{customerBills.length}</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap gap-2.5 bg-obsidian-900/80 p-3 rounded-xl border border-gold-500/20 justify-between items-center">
            <div className="flex gap-2">
              <Button variant="gold" size="sm" onClick={handleNewBill} icon={<Plus className="w-4 h-4" />}>
                + New Bill
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowPaymentModal(true)} icon={<DollarSign className="w-4 h-4 text-emerald-400" />}>
                + Payment
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                Print Statement
              </Button>
            </div>
          </div>

          {/* Account Tabs */}
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-gold-500/15 pb-2">
              {[
                { id: "purchases", label: `Purchase History (${customerBills.length})`, icon: ShoppingBag },
                { id: "payments", label: `Payments (${customerPayments.length})`, icon: CreditCard },
                { id: "ledger", label: `Khata Ledger (${customerLedger.length})`, icon: BookOpen },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? "bg-gold-500 text-obsidian-950 shadow-gold"
                        : "bg-obsidian-900 text-slate-400 border border-gold-500/10 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Purchase History */}
            {activeTab === "purchases" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Products</TableCell>
                    <TableCell>Grand Total</TableCell>
                    <TableCell>Paid / Due</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell className="text-right">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerBills.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="text-xs text-slate-400">
                        {formatDate(b.date)} • {formatTime(b.date)}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => setSelectedBillForPreview(b)}
                          className="font-mono font-bold text-gold-400 hover:text-gold-300 hover:underline cursor-pointer text-left"
                        >
                          {b.invoiceNo}
                        </button>
                      </TableCell>
                      <TableCell className="text-xs text-slate-300 max-w-xs truncate">
                        {b.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                      </TableCell>
                      <TableCell className="font-bold text-slate-100">
                        {formatCurrency(b.calculation.grandTotal)}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="text-emerald-400 font-semibold">{formatCurrency(b.calculation.paidAmount)}</span>
                        {b.calculation.dueAmount > 0 && (
                          <span className="text-rose-400 font-semibold block">Due: {formatCurrency(b.calculation.dueAmount)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={b.paymentStatus === "PAID" ? "paid" : "due"}>{b.paymentStatus}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBillForPreview(b)}
                          icon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View Bill
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Tab 2: Payment History */}
            {activeTab === "payments" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Payment Mode</TableCell>
                    <TableCell>Reference ID</TableCell>
                    <TableCell>Invoice #</TableCell>
                    <TableCell className="text-right">Amount Received</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerPayments.map((p) => {
                    const matchedBill = bills.find((b) => b.invoiceNo === p.invoiceNo || b.id === p.billId);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs text-slate-400">
                          {formatDate(p.date)} • {formatTime(p.date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="gold">{p.method}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-400">{p.referenceNo || "-"}</TableCell>
                        <TableCell>
                          {matchedBill ? (
                            <button
                              onClick={() => setSelectedBillForPreview(matchedBill)}
                              className="font-mono font-bold text-gold-400 hover:text-gold-300 hover:underline cursor-pointer text-left"
                            >
                              {p.invoiceNo}
                            </button>
                          ) : (
                            <span className="font-mono text-gold-400">{p.invoiceNo}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-extrabold text-emerald-400">
                          {formatCurrency(p.amount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {/* Tab 3: Khata Ledger */}
            {activeTab === "ledger" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell className="text-right">Debit (+Due)</TableCell>
                    <TableCell className="text-right">Credit (-Paid)</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerLedger.map((l) => {
                    const cleanRef = l.referenceNo.replace("REV-", "");
                    const matchedBill = bills.find((b) => b.invoiceNo === cleanRef || b.invoiceNo === l.referenceNo);
                    return (
                      <TableRow key={l.id}>
                        <TableCell className="text-xs text-slate-400">
                          {formatDate(l.date)} • {formatTime(l.date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={l.type === "CREDIT" ? "paid" : "due"}>{l.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {matchedBill ? (
                            <button
                              onClick={() => setSelectedBillForPreview(matchedBill)}
                              className="font-mono font-bold text-gold-400 hover:text-gold-300 hover:underline cursor-pointer text-left"
                            >
                              {l.referenceNo}
                            </button>
                          ) : (
                            <span className="font-mono text-gold-400">{l.referenceNo}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-300">{l.description}</TableCell>
                        <TableCell className="text-right font-bold text-rose-400">
                          {l.type === "DEBIT" ? formatCurrency(l.amount) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-emerald-400">
                          {l.type === "CREDIT" ? formatCurrency(l.amount) : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Add Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title={`Record Payment - ${customer.name}`}>
        <form onSubmit={handleSavePayment} className="space-y-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs flex justify-between">
            <span className="text-slate-300">Current Lena Hai (Due Balance):</span>
            <span className="font-extrabold text-rose-400">{formatCurrency(lenaHai)}</span>
          </div>

          <Input
            label="Payment Amount (₹) *"
            type="number"
            value={payAmount || ""}
            onChange={(e) => setPayAmount(Number(e.target.value))}
            placeholder="Enter received amount"
            required
          />

          <Select
            label="Payment Method"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value as any)}
            options={[
              { label: "UPI / QR Code", value: "UPI" },
              { label: "Cash", value: "CASH" },
              { label: "Card", value: "CARD" },
              { label: "Bank Transfer", value: "BANK_TRANSFER" },
            ]}
          />

          <Input
            label="Transaction Reference / Note (Optional)"
            value={payRef}
            onChange={(e) => setPayRef(e.target.value)}
            placeholder="e.g. UPI/987123/PAY"
          />

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowPaymentModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="gold" type="submit" className="flex-1 font-bold">
              Save Payment ({formatCurrency(payAmount)})
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bill View Modal */}
      {selectedBillForPreview && (
        <Modal
          isOpen={!!selectedBillForPreview}
          onClose={() => setSelectedBillForPreview(null)}
          title={`Invoice ${selectedBillForPreview.invoiceNo}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => sendInvoiceWhatsApp(selectedBillForPreview, settings)}
                icon={<MessageCircle className="w-4 h-4 text-emerald-400" />}
              >
                Send PDF on WhatsApp
              </Button>
              <Button variant="gold" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                Print Invoice
              </Button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto rounded-xl border border-slate-200">
              <BillTemplateA4 bill={selectedBillForPreview} settings={settings} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
