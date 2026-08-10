"use client";

import React, { useState, useMemo, useDeferredValue } from "react";
import { useLedgerStore } from "@/store/ledger-store";
import { useCustomerStore } from "@/store/customer-store";
import { useBillingStore } from "@/store/billing-store";
import { useSettingsStore } from "@/store/settings-store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { BillTemplateA4 } from "@/components/bills/BillTemplateA4";
import { CustomerAccountDrawer } from "@/components/customers/CustomerAccountDrawer";
import { SupplierAccountDrawer } from "@/components/ledger/SupplierAccountDrawer";
import { BookOpen, Plus, ArrowDownLeft, ArrowUpRight, Printer, Search, MessageCircle, Eye, User, Phone, CheckCircle2, ListFilter, Building, Image as ImageIcon } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/currency";
import { Bill } from "@/types/bill";
import { Customer } from "@/types/customer";
import { sendInvoiceWhatsApp } from "@/lib/whatsapp";
import { downloadInvoiceAsImage } from "@/lib/image-export";

export default function LedgerPage() {
  const { ledger, addLedgerEntry } = useLedgerStore();
  const { customers, recordPayment } = useCustomerStore();
  const { bills } = useBillingStore();
  const { settings } = useSettingsStore();

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedCustomerForAccount, setSelectedCustomerForAccount] = useState<Customer | null>(null);
  const [selectedSupplierForAccount, setSelectedSupplierForAccount] = useState<string | null>(null);

  // Modals for Top 3 Overview KPI Cards
  const [showReceivablesModal, setShowReceivablesModal] = useState(false);
  const [showPayablesModal, setShowPayablesModal] = useState(false);
  const [showNetModal, setShowNetModal] = useState(false);

  const [partyId, setPartyId] = useState(customers[0]?.id || "");
  const [type, setType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");

  const dueCustomers = useMemo(() => customers.filter((c) => c.dueBalance > 0), [customers]);
  const supplierPayables = useMemo(() => ledger.filter((l) => l.partyType === "SUPPLIER"), [ledger]);

  const totalReceivables = useMemo(() => dueCustomers.reduce((sum, c) => sum + c.dueBalance, 0), [dueCustomers]);
  const totalPayables = useMemo(() => supplierPayables.reduce((sum, l) => sum + l.amount, 0), [supplierPayables]);
  const netBalance = totalReceivables - totalPayables;

  const filteredLedger = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return ledger;

    return ledger.filter(
      (item) =>
        item.partyName.toLowerCase().includes(query) ||
        item.referenceNo.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        String(item.amount).includes(query)
    );
  }, [ledger, deferredSearch]);

  const handleOpenPartyAccount = (partyName: string, partyId: string, partyType?: string) => {
    if (partyType === "SUPPLIER" || ledger.some((l) => l.partyName === partyName && l.partyType === "SUPPLIER")) {
      setSelectedSupplierForAccount(partyName);
    } else {
      const matched = customers.find((c) => c.id === partyId || c.name.toLowerCase() === partyName.toLowerCase());
      if (matched) {
        setSelectedCustomerForAccount(matched);
      }
    }
  };

  const handleOpenBill = (refNo: string) => {
    const cleanRef = refNo.replace("REV-", "").trim();

    const matched = bills.find((b) => {
      if (b.invoiceNo === cleanRef || b.invoiceNo === refNo) return true;
      if (cleanRef.startsWith("INV-")) {
        const numPart = cleanRef.replace("INV-", "");
        return b.invoiceNo.endsWith(numPart);
      }
      return false;
    });

    if (matched) {
      setSelectedBill(matched);
    } else if (bills.length > 0) {
      setSelectedBill(bills[0]);
    }
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    const selectedCust = customers.find((c) => c.id === partyId);
    if (!selectedCust) return;

    addLedgerEntry({
      partyId: selectedCust.id,
      partyName: selectedCust.name,
      partyType: "CUSTOMER",
      type,
      amount: Number(amount),
      runningBalance: Math.max(0, selectedCust.dueBalance - Number(amount)),
      referenceNo: `REC-${Date.now().toString().slice(-6)}`,
      description: description || `Payment received from ${selectedCust.name}`,
    });

    if (type === "CREDIT") {
      recordPayment(selectedCust.id, Number(amount));
    }

    setShowAddModal(false);
    setAmount(0);
    setDescription("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="📖 Customer Ledger (Khata Account)"
        subtitle="Party Credit / Debit Account Tracker, Statement Breakdown & Tax Invoice Viewer"
        action={
          <Button variant="gold" onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
            Record Payment / Entry
          </Button>
        }
      />

      {/* Overview Interactive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Receivables */}
        <div
          onClick={() => setShowReceivablesModal(true)}
          className="glass-panel glass-panel-hover p-5 rounded-2xl border border-emerald-500/30 flex items-center justify-between cursor-pointer active:scale-98 transition-all group"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Total Receivables (Lena Hai)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold">
                {dueCustomers.length} Parties
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-emerald-300 mt-1">{formatCurrency(totalReceivables)}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 group-hover:text-emerald-400 transition-colors">
              Click to view customer dues list →
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Payables */}
        <div
          onClick={() => setShowPayablesModal(true)}
          className="glass-panel glass-panel-hover p-5 rounded-2xl border border-rose-500/30 flex items-center justify-between cursor-pointer active:scale-98 transition-all group"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Total Payables (Dena Hai)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-extrabold">
                {supplierPayables.length} Suppliers
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-rose-300 mt-1">{formatCurrency(totalPayables)}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 group-hover:text-rose-400 transition-colors">
              Click to view supplier payables →
            </p>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl group-hover:bg-rose-500/20 transition-colors">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Net Khata */}
        <div
          onClick={() => setShowNetModal(true)}
          className="glass-panel glass-panel-hover p-5 rounded-2xl border border-gold-500/30 flex items-center justify-between cursor-pointer active:scale-98 transition-all group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-400">Net Khata Balance</span>
            <h3 className="text-2xl font-extrabold text-gold-300 mt-1">{formatCurrency(netBalance)}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 group-hover:text-gold-400 transition-colors">
              Click to view net balance breakdown →
            </p>
          </div>
          <div className="p-3 bg-gold-500/10 text-gold-400 rounded-xl group-hover:bg-gold-500/20 transition-colors">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Fast Search Input */}
      <div className="glass-panel p-4 rounded-xl border border-gold-500/15">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search party name, reference #, description..."
            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>
      </div>

      {/* Ledger Master Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Party Name</TableCell>
            <TableCell>Party Type</TableCell>
            <TableCell>Reference #</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Type</TableCell>
            <TableCell className="text-right">Amount</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLedger.map((item) => {
            return (
              <TableRow key={item.id}>
                <TableCell className="text-xs text-slate-400">{formatDate(item.date)}</TableCell>
                <TableCell>
                  <button
                    onClick={() => handleOpenPartyAccount(item.partyName, item.partyId, item.partyType)}
                    className="font-bold text-slate-100 hover:text-gold-400 hover:underline cursor-pointer text-left flex items-center gap-1.5"
                  >
                    {item.partyName}
                    <Eye className="w-3 h-3 text-gold-500/70" />
                  </button>
                </TableCell>
                <TableCell className="text-xs text-slate-300">{item.partyType}</TableCell>
                <TableCell>
                  <button
                    onClick={() => handleOpenBill(item.referenceNo)}
                    className="font-mono font-bold text-gold-400 hover:text-gold-300 hover:underline text-left cursor-pointer flex items-center gap-1"
                  >
                    {item.referenceNo}
                  </button>
                </TableCell>
                <TableCell className="text-xs text-slate-300">{item.description}</TableCell>
                <TableCell>
                  <Badge variant={item.type === "CREDIT" ? "paid" : "due"}>{item.type}</Badge>
                </TableCell>
                <TableCell className="text-right font-extrabold text-slate-100">
                  {formatCurrency(item.amount)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* 1. Modal: Total Receivables (Kisse Lene Hain) */}
      <Modal
        isOpen={showReceivablesModal}
        onClose={() => setShowReceivablesModal(false)}
        title={`📥 Receivables Breakdown - Kisse Lene Hain (${formatCurrency(totalReceivables)})`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Below is the list of all {dueCustomers.length} customers with outstanding due balances:
          </p>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {dueCustomers.map((cust) => (
              <div
                key={cust.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-obsidian-900 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-slate-100 text-sm">{cust.name}</h5>
                    <span className="text-[10px] font-mono text-slate-400">{cust.phone}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Total Bills: {cust.totalBills} • Total Spent: {formatCurrency(cust.totalSpent)}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Due Balance</span>
                    <span className="text-base font-extrabold text-rose-400">{formatCurrency(cust.dueBalance)}</span>
                  </div>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => {
                      setShowReceivablesModal(false);
                      setSelectedCustomerForAccount(cust);
                    }}
                    icon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Statement
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* 2. Modal: Total Payables (Kisko Dene Hain) */}
      <Modal
        isOpen={showPayablesModal}
        onClose={() => setShowPayablesModal(false)}
        title={`📤 Payables Breakdown - Kisko Dene Hain (${formatCurrency(totalPayables)})`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Below is the list of supplier & vendor pending payables recorded in khata ledger:
          </p>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {supplierPayables.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setShowPayablesModal(false);
                  setSelectedSupplierForAccount(item.partyName);
                }}
                className="flex items-center justify-between p-3.5 rounded-xl bg-obsidian-900 border border-rose-500/20 hover:border-rose-500/40 transition-colors cursor-pointer active:scale-98"
              >
                <div>
                  <h5 className="font-bold text-slate-100 text-sm hover:text-gold-400 transition-colors">{item.partyName}</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Ref: <span className="font-mono text-gold-400 font-bold">{item.referenceNo}</span> • {item.description}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Payable Balance</span>
                    <span className="text-base font-extrabold text-rose-400">{formatCurrency(item.amount)}</span>
                  </div>
                  <Button variant="gold" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                    Account
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* 3. Modal: Net Khata Balance Summary */}
      <Modal
        isOpen={showNetModal}
        onClose={() => setShowNetModal(false)}
        title={`⚖️ Net Khata Balance Statement (${formatCurrency(netBalance)})`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
              <span className="text-[9px] font-extrabold uppercase text-emerald-400 block">Receivables (Lena)</span>
              <span className="text-sm font-extrabold text-emerald-300 mt-1 block">{formatCurrency(totalReceivables)}</span>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl">
              <span className="text-[9px] font-extrabold uppercase text-rose-400 block">Payables (Dena)</span>
              <span className="text-sm font-extrabold text-rose-300 mt-1 block">{formatCurrency(totalPayables)}</span>
            </div>
            <div className="bg-gold-500/10 border border-gold-500/30 p-3 rounded-xl">
              <span className="text-[9px] font-extrabold uppercase text-gold-400 block">Net Balance</span>
              <span className="text-sm font-extrabold text-gold-300 mt-1 block">{formatCurrency(netBalance)}</span>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-200 border-b border-gold-500/10 pb-1 mt-4">
            Khata Outstanding Parties Summary
          </p>

          <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
            {dueCustomers.map((cust) => (
              <div
                key={cust.id}
                onClick={() => {
                  setShowNetModal(false);
                  setSelectedCustomerForAccount(cust);
                }}
                className="flex justify-between items-center p-2.5 rounded-lg bg-obsidian-900/80 border border-gold-500/10 hover:border-gold-500/30 cursor-pointer"
              >
                <div>
                  <span className="font-bold text-slate-100 text-xs">{cust.name}</span>
                  <span className="text-[9px] text-slate-400 block font-mono">{cust.phone}</span>
                </div>
                <span className="text-xs font-extrabold text-emerald-400">Lena: {formatCurrency(cust.dueBalance)}</span>
              </div>
            ))}
            {supplierPayables.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setShowNetModal(false);
                  setSelectedSupplierForAccount(item.partyName);
                }}
                className="flex justify-between items-center p-2.5 rounded-lg bg-obsidian-900/80 border border-rose-500/10 hover:border-rose-500/30 cursor-pointer"
              >
                <div>
                  <span className="font-bold text-slate-100 text-xs">{item.partyName}</span>
                  <span className="text-[9px] text-slate-400 block font-mono">Supplier</span>
                </div>
                <span className="text-xs font-extrabold text-rose-400">Dena: {formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Add Khata Entry Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Record Khata Payment Entry">
        <form onSubmit={handleSaveEntry} className="space-y-3">
          <Select
            label="Select Party / Customer"
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            options={customers.map((c) => ({ label: `${c.name} (Due ${formatCurrency(c.dueBalance)})`, value: c.id }))}
          />
          <Select
            label="Entry Type"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            options={[
              { label: "CREDIT (Payment Received)", value: "CREDIT" },
              { label: "DEBIT (Charge / New Credit Purchase)", value: "DEBIT" },
            ]}
          />
          <Input label="Amount (₹) *" type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} required />
          <Input label="Description / Remarks" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="gold" type="submit" className="flex-1 font-bold">
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Tax Invoice Preview Modal */}
      {selectedBill && (
        <Modal
          isOpen={!!selectedBill}
          onClose={() => setSelectedBill(null)}
          title={`Tax Invoice - ${selectedBill.invoiceNo}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => downloadInvoiceAsImage(selectedBill.invoiceNo, selectedBill.customerName)}
                icon={<ImageIcon className="w-4 h-4 text-amber-400" />}
              >
                Download Image PNG
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => sendInvoiceWhatsApp(selectedBill, settings)}
                icon={<MessageCircle className="w-4 h-4 text-emerald-400" />}
              >
                WhatsApp
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

      {/* Customer Account Statement Drawer */}
      {selectedCustomerForAccount && (
        <CustomerAccountDrawer
          customer={selectedCustomerForAccount}
          isOpen={!!selectedCustomerForAccount}
          onClose={() => setSelectedCustomerForAccount(null)}
        />
      )}

      {/* Supplier Account Statement Drawer */}
      {selectedSupplierForAccount && (
        <SupplierAccountDrawer
          supplierName={selectedSupplierForAccount}
          entries={ledger}
          settings={settings}
          isOpen={!!selectedSupplierForAccount}
          onClose={() => setSelectedSupplierForAccount(null)}
          onRecordSettlement={() => setShowAddModal(true)}
        />
      )}
    </div>
  );
}
