"use client";

import React, { useState, useMemo, useDeferredValue } from "react";
import { useLedgerStore } from "@/store/ledger-store";
import { useBillingStore } from "@/store/billing-store";
import { useCustomerStore } from "@/store/customer-store";
import { useSettingsStore } from "@/store/settings-store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PaymentDetailDrawer } from "@/components/payments/PaymentDetailDrawer";
import { BillTemplateA4 } from "@/components/bills/BillTemplateA4";
import { BillActionToolbar } from "@/components/bills/BillActionToolbar";
import { CustomerAccountDrawer } from "@/components/customers/CustomerAccountDrawer";
import { Bill } from "@/types/bill";
import { normalizeIndianMobile, sendInvoiceWhatsApp } from "@/lib/whatsapp";
import { formatCurrency, formatDate, formatTime } from "@/lib/currency";
import { PaymentRecord, PaymentStatus } from "@/types/payment";
import { Customer } from "@/types/customer";
import {
  Search,
  Plus,
  DollarSign,
  Download,
  Printer,
  Eye,
  CreditCard,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react";

export default function PaymentsPage() {
  const { payments, addPaymentRecord, addLedgerEntry } = useLedgerStore();
  const { bills } = useBillingStore();
  const { customers, recordPayment } = useCustomerStore();
  const { settings } = useSettingsStore();

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [methodFilter, setMethodFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [selectedPaymentBill, setSelectedPaymentBill] = useState<Bill | null>(null);
  const [selectedCustForDrawer, setSelectedCustForDrawer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCollectCust, setSelectedCollectCust] = useState<Customer | null>(null);

  // Add Payment Form State
  const [payCustId, setPayCustId] = useState("");
  const [payInvoiceNo, setPayInvoiceNo] = useState("");
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<"CASH" | "UPI" | "CARD" | "BANK_TRANSFER">("UPI");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const yesterdayStr = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();

  // 1. Dynamic KPI Summary Cards
  const kpis = useMemo(() => {
    let todayReceived = 0;
    let cashToday = 0;
    let upiToday = 0;
    let cardToday = 0;
    let bankToday = 0;
    let dueCollectionToday = 0;

    for (let i = 0; i < payments.length; i++) {
      const p = payments[i];
      if (p.status === "REFUNDED" || p.status === "FAILED") continue;

      const isToday = p.date.startsWith(todayStr);
      if (isToday) {
        todayReceived += p.amount;
        if (p.method === "CASH") cashToday += p.amount;
        if (p.method === "UPI") upiToday += p.amount;
        if (p.method === "CARD") cardToday += p.amount;
        if (p.method === "BANK_TRANSFER") bankToday += p.amount;
        if (p.invoiceNo === "DIRECT-REC" || p.referenceNo?.includes("REC-")) dueCollectionToday += p.amount;
      }
    }

    return {
      todayReceived,
      cashToday,
      upiToday,
      cardToday,
      bankToday,
      dueCollectionToday,
      totalCount: payments.length,
    };
  }, [payments, todayStr]);

  // 2. Filtered Payments Stream
  const filteredPayments = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return payments.filter((p) => {
      const matchesSearch =
        !query ||
        p.customerName.toLowerCase().includes(query) ||
        (p.customerPhone && p.customerPhone.includes(query)) ||
        p.invoiceNo.toLowerCase().includes(query) ||
        (p.referenceNo && p.referenceNo.toLowerCase().includes(query)) ||
        String(p.amount).includes(query);

      if (!matchesSearch) return false;

      if (methodFilter === "cash" && p.method !== "CASH") return false;
      if (methodFilter === "upi" && p.method !== "UPI") return false;
      if (methodFilter === "card" && p.method !== "CARD") return false;
      if (methodFilter === "bank" && p.method !== "BANK_TRANSFER") return false;
      if (methodFilter === "due_collection" && (!p.referenceNo?.includes("REC-") && p.invoiceNo !== "DIRECT-REC")) return false;

      if (statusFilter === "completed" && p.status !== "COMPLETED") return false;
      if (statusFilter === "pending" && p.status !== "PENDING") return false;
      if (statusFilter === "failed" && p.status !== "FAILED") return false;
      if (statusFilter === "refunded" && p.status !== "REFUNDED") return false;

      if (periodFilter === "today" && !p.date.startsWith(todayStr)) return false;
      if (periodFilter === "yesterday" && !p.date.startsWith(yesterdayStr)) return false;
      if (periodFilter === "this_week" && new Date(p.date).getTime() < sevenDaysAgo) return false;
      if (periodFilter === "this_month" && new Date(p.date).getTime() < thirtyDaysAgo) return false;

      return true;
    });
  }, [payments, deferredSearch, methodFilter, periodFilter, statusFilter, todayStr, yesterdayStr, sevenDaysAgo, thirtyDaysAgo]);

  // Outstanding Dues Customers
  const dueCustomers = useMemo(() => {
    return customers.filter((c) => c.dueBalance > 0);
  }, [customers]);

  const handleOpenAddModal = (cust?: Customer) => {
    if (cust) {
      setPayCustId(cust.id);
      setSelectedCollectCust(cust);
    } else {
      setPayCustId(customers[0]?.id || "");
      setSelectedCollectCust(customers[0] || null);
    }
    setShowAddModal(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || payAmount <= 0) return;

    const targetCust = customers.find((c) => c.id === payCustId);
    if (!targetCust) return;

    recordPayment(targetCust.id, payAmount);

    const refStr = payRef || `REC-${Date.now().toString().slice(-6)}`;

    addLedgerEntry({
      partyId: targetCust.id,
      partyName: targetCust.name,
      partyType: "CUSTOMER",
      type: "CREDIT",
      amount: payAmount,
      runningBalance: Math.max(0, targetCust.dueBalance - payAmount),
      referenceNo: refStr,
      description: payNotes || `Payment collected via ${payMethod}`,
    });

    addPaymentRecord({
      billId: payInvoiceNo ? `bill-${payInvoiceNo}` : `bill-${Date.now()}`,
      invoiceNo: payInvoiceNo || "DIRECT-REC",
      customerId: targetCust.id,
      customerName: targetCust.name,
      customerPhone: targetCust.phone,
      amount: payAmount,
      method: payMethod,
      referenceNo: refStr,
      notes: payNotes,
      status: "COMPLETED",
    });

    setShowAddModal(false);
    setPayAmount(0);
    setPayRef("");
    setPayNotes("");
  };

  const handleExportCSV = () => {
    const headers = "Date,Invoice,Customer,Phone,Method,Reference,Amount,Status\n";
    const rows = filteredPayments
      .map(
        (p) =>
          `"${p.date}","${p.invoiceNo}","${p.customerName}","${p.customerPhone || ""}","${p.method}","${p.referenceNo || ""}","${p.amount}","${p.status}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Payment_Audit_Export_${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="💳 Payment Management & Reconciliation"
        subtitle="Live payment stream, cash audit log, due collection & instant customer reconciliation"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} icon={<Download className="w-4 h-4" />}>
              Export CSV
            </Button>
            <Button variant="gold" size="sm" onClick={() => handleOpenAddModal()} icon={<Plus className="w-4 h-4" />}>
              + Add Payment
            </Button>
          </div>
        }
      />

      {/* 1. Dynamic KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-gold-500/20 bg-gold-500/5">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-gold-400 block">Today Received</span>
          <span className="text-base font-extrabold text-slate-100 mt-1 block">{formatCurrency(kpis.todayReceived)}</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400 block">Cash</span>
          <span className="text-base font-extrabold text-emerald-300 mt-1 block">{formatCurrency(kpis.cashToday)}</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-400 block">UPI</span>
          <span className="text-base font-extrabold text-blue-300 mt-1 block">{formatCurrency(kpis.upiToday)}</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-400 block">Card</span>
          <span className="text-base font-extrabold text-purple-300 mt-1 block">{formatCurrency(kpis.cardToday)}</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400 block">Bank</span>
          <span className="text-base font-extrabold text-amber-300 mt-1 block">{formatCurrency(kpis.bankToday)}</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-400 block">Due Collection</span>
          <span className="text-base font-extrabold text-rose-300 mt-1 block">{formatCurrency(kpis.dueCollectionToday)}</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-gold-500/15">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Transactions</span>
          <span className="text-base font-extrabold text-slate-100 mt-1 block">{kpis.totalCount}</span>
        </div>
      </div>

      {/* 2. Due Collection Action Bar */}
      {dueCustomers.length > 0 && (
        <div className="glass-panel p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Dues Pending Collection ({dueCustomers.length} Customers)
            </span>
            <span className="text-xs font-bold text-slate-300">
              Total Outstanding: <strong className="text-rose-300">{formatCurrency(dueCustomers.reduce((s, c) => s + c.dueBalance, 0))}</strong>
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {dueCustomers.slice(0, 8).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-obsidian-900/90 border border-rose-500/20 whitespace-nowrap"
              >
                <div>
                  <p className="text-xs font-bold text-slate-100">{c.name}</p>
                  <p className="text-[10px] font-bold text-rose-400">Due: {formatCurrency(c.dueBalance)}</p>
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => handleOpenAddModal(c)}
                  className="text-[10px] px-2 py-1"
                >
                  COLLECT PAYMENT
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-gold-500/15 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, mobile, invoice #, or ref ID..."
              className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          {/* Live Cash Reconciliation Widget */}
          <div className="flex gap-4 text-xs bg-obsidian-900/80 px-3 py-1.5 rounded-lg border border-gold-500/15">
            <div>
              <span className="text-slate-400">Recorded Cash: </span>
              <strong className="text-emerald-400">{formatCurrency(kpis.cashToday)}</strong>
            </div>
            <div>
              <span className="text-slate-400">Difference: </span>
              <strong className="text-gold-400">₹0</strong>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-gold-500/10">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-slate-400 py-1.5 px-1">Method:</span>
            {[
              { id: "all", label: "All" },
              { id: "cash", label: "Cash" },
              { id: "upi", label: "UPI" },
              { id: "card", label: "Card" },
              { id: "bank", label: "Bank" },
              { id: "due_collection", label: "Due Collection" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setMethodFilter(f.id)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                  methodFilter === f.id
                    ? "bg-gold-500 text-obsidian-950 font-bold"
                    : "bg-obsidian-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 overflow-x-auto no-scrollbar ml-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 py-1.5 px-1">Status:</span>
            {[
              { id: "all", label: "All" },
              { id: "completed", label: "Completed" },
              { id: "pending", label: "Pending" },
              { id: "refunded", label: "Refunded" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === f.id
                    ? "bg-gold-500 text-obsidian-950 font-bold"
                    : "bg-obsidian-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Desktop/Tablet Master Payment Table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Invoice #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Reference ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell className="text-right">Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="text-xs text-slate-400">
                  {formatDate(p.date)} • {formatTime(p.date)}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => {
                      const matched = bills.find((b) => b.invoiceNo === p.invoiceNo);
                      if (matched) setSelectedPaymentBill(matched);
                      else setSelectedPayment(p);
                    }}
                    className="font-mono font-bold text-gold-400 hover:text-gold-300 hover:underline text-left cursor-pointer"
                  >
                    {p.invoiceNo}
                  </button>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => {
                      const matchedCust = customers.find((c) => c.id === p.customerId || c.name === p.customerName);
                      if (matchedCust) setSelectedCustForDrawer(matchedCust);
                    }}
                    className="font-bold text-slate-100 hover:text-gold-400 hover:underline text-left cursor-pointer"
                  >
                    {p.customerName}
                  </button>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-300">
                  {normalizeIndianMobile(p.customerPhone || "")}
                </TableCell>
                <TableCell>
                  <Badge variant="gold">{p.method}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-300">{p.referenceNo || "POS-CASH"}</TableCell>
                <TableCell className="font-extrabold text-emerald-400">{formatCurrency(p.amount)}</TableCell>
                <TableCell>
                  <Badge variant={p.status === "COMPLETED" ? "paid" : p.status === "REFUNDED" ? "due" : "neutral"}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPayment(p)}
                    icon={<Eye className="w-3.5 h-3.5" />}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 5. Mobile Responsive Payment Cards View */}
      <div className="sm:hidden space-y-3">
        {filteredPayments.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelectedPayment(p)}
            className="glass-panel p-4 rounded-xl border border-gold-500/20 space-y-2 cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-bold text-slate-100 text-sm">{p.customerName}</h5>
                <p className="text-[10px] text-slate-400 font-mono">
                  {formatDate(p.date)} • {formatTime(p.date)}
                </p>
              </div>
              <span className="text-base font-extrabold text-emerald-400">{formatCurrency(p.amount)}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-gold-500/10">
              <span className="font-mono font-bold text-gold-400">{p.invoiceNo}</span>
              <div className="flex gap-1.5">
                <Badge variant="gold">{p.method}</Badge>
                <Badge variant={p.status === "COMPLETED" ? "paid" : "due"}>{p.status}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 6. Payment Detail Drawer */}
      <PaymentDetailDrawer
        payment={selectedPayment}
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />

      {/* 7. Add Payment Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Record Customer Payment">
        <form onSubmit={handleSavePayment} className="space-y-3">
          <Select
            label="Select Customer *"
            value={payCustId}
            onChange={(e) => {
              setPayCustId(e.target.value);
              const found = customers.find((c) => c.id === e.target.value);
              setSelectedCollectCust(found || null);
            }}
            options={customers.map((c) => ({
              label: `${c.name} (${c.phone}) ${c.dueBalance > 0 ? `- Due ${formatCurrency(c.dueBalance)}` : ""}`,
              value: c.id,
            }))}
          />

          {selectedCollectCust && selectedCollectCust.dueBalance > 0 && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs flex justify-between">
              <span className="text-slate-300">Outstanding Due Balance:</span>
              <span className="font-extrabold text-rose-400">{formatCurrency(selectedCollectCust.dueBalance)}</span>
            </div>
          )}

          <Input
            label="Related Invoice No (Optional)"
            value={payInvoiceNo}
            onChange={(e) => setPayInvoiceNo(e.target.value)}
            placeholder="e.g. INV-2026-00308"
          />

          <Input
            label="Payment Amount Received (₹) *"
            type="number"
            value={payAmount || ""}
            onChange={(e) => setPayAmount(Number(e.target.value))}
            placeholder="Enter received amount"
            required
          />

          <Select
            label="Payment Method *"
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
            label="Reference ID (Optional)"
            value={payRef}
            onChange={(e) => setPayRef(e.target.value)}
            placeholder="e.g. REC-987123 / UPI-AUTH"
          />

          <Input
            label="Payment Notes (Optional)"
            value={payNotes}
            onChange={(e) => setPayNotes(e.target.value)}
            placeholder="e.g. Part payment received via PhonePe"
          />

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="gold" type="submit" className="flex-1 font-bold">
              Save Payment ({formatCurrency(payAmount)})
            </Button>
          </div>
        </form>
      </Modal>

      {/* Tax Invoice Detail Modal */}
      {selectedPaymentBill && (
        <Modal
          isOpen={!!selectedPaymentBill}
          onClose={() => setSelectedPaymentBill(null)}
          title={`Tax Invoice - ${selectedPaymentBill.invoiceNo}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <BillActionToolbar bill={selectedPaymentBill} settings={settings} />

            <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200">
              <BillTemplateA4 bill={selectedPaymentBill} settings={settings} />
            </div>
          </div>
        </Modal>
      )}

      {/* Customer Account Drawer */}
      {selectedCustForDrawer && (
        <CustomerAccountDrawer
          customer={selectedCustForDrawer}
          isOpen={!!selectedCustForDrawer}
          onClose={() => setSelectedCustForDrawer(null)}
        />
      )}
    </div>
  );
}
