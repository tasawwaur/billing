"use client";

import React, { useState, useMemo, useDeferredValue, useCallback } from "react";
import { useCustomerStore } from "@/store/customer-store";
import { useBillingStore } from "@/store/billing-store";
import { useLedgerStore } from "@/store/ledger-store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { CustomerAccountDrawer } from "@/components/customers/CustomerAccountDrawer";
import {
  Plus,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Users,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/currency";
import { Customer } from "@/types/customer";

const PAGE_SIZE = 25;

export default function CustomersPage() {
  const customers = useCustomerStore((state) => state.customers);
  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const recordPayment = useCustomerStore((state) => state.recordPayment);
  const recordDenaPayment = useCustomerStore((state) => state.recordDenaPayment);
  
  const bills = useBillingStore((state) => state.bills);
  const { addLedgerEntry, addPaymentRecord } = useLedgerStore();

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterTab, setFilterTab] = useState<"all" | "due" | "dena" | "clear" | "vip" | "gstin">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDrawerCustomer, setSelectedDrawerCustomer] = useState<Customer | null>(null);

  // Settlement Modal State
  const [settleCustomer, setSettleCustomer] = useState<Customer | null>(null);
  const [settleMode, setSettleMode] = useState<"RECEIVE_LENA" | "PAY_DENA">("RECEIVE_LENA");
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settleMethod, setSettleMethod] = useState<"CASH" | "UPI" | "CARD" | "BANK_TRANSFER">("UPI");
  const [settleRef, setSettleRef] = useState<string>("");

  // New customer form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // Totals for top KPI summary cards
  const summaryMetrics = useMemo(() => {
    let totalLena = 0;
    let totalDena = 0;
    let dueCount = 0;
    let denaCount = 0;
    let clearCount = 0;
    let vipCount = 0;
    let gstinCount = 0;

    for (let i = 0; i < customers.length; i++) {
      const c = customers[i];
      if (c.dueBalance > 0) {
        totalLena += c.dueBalance;
        dueCount++;
      }
      if ((c.denaBalance || 0) > 0) {
        totalDena += (c.denaBalance || 0);
        denaCount++;
      }
      if (c.dueBalance === 0 && (!c.denaBalance || c.denaBalance === 0)) {
        clearCount++;
      }
      if (c.totalSpent >= 100000) {
        vipCount++;
      }
      if (c.gstin) {
        gstinCount++;
      }
    }

    return {
      allCount: customers.length,
      dueCount,
      denaCount,
      clearCount,
      vipCount,
      gstinCount,
      totalLena,
      totalDena,
    };
  }, [customers]);

  // Dynamic Filtered Customer List
  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return customers.filter((c) => {
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.phone.replace("+91", "").includes(query) ||
        (c.gstin && c.gstin.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (filterTab === "due") return c.dueBalance > 0;
      if (filterTab === "dena") return (c.denaBalance || 0) > 0;
      if (filterTab === "clear") return c.dueBalance === 0 && (!c.denaBalance || c.denaBalance === 0);
      if (filterTab === "vip") return c.totalSpent >= 100000;
      if (filterTab === "gstin") return !!c.gstin;

      return true;
    });
  }, [customers, deferredSearch, filterTab]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleFilterSelect = (tab: "all" | "due" | "dena" | "clear" | "vip" | "gstin") => {
    setFilterTab(tab);
    setCurrentPage(1);
  };

  const handleSaveCustomer = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name || !phone) return;
      const newCust = addCustomer({ name, phone, email, address });
      setShowAddModal(false);
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setSelectedDrawerCustomer(newCust);
    },
    [name, phone, email, address, addCustomer]
  );

  const handleOpenSettlement = (cust: Customer, mode: "RECEIVE_LENA" | "PAY_DENA") => {
    setSettleCustomer(cust);
    setSettleMode(mode);
    if (mode === "RECEIVE_LENA") {
      setSettleAmount(cust.dueBalance > 0 ? cust.dueBalance : 500);
    } else {
      setSettleAmount((cust.denaBalance || 0) > 0 ? (cust.denaBalance || 0) : 3000);
    }
    setSettleRef("");
  };

  const handleSaveSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleCustomer || !settleAmount || settleAmount <= 0) return;

    const custBills = bills.filter((b) => b.customerId === settleCustomer.id || b.customerPhone === settleCustomer.phone);

    if (settleMode === "RECEIVE_LENA") {
      recordPayment(settleCustomer.id, settleAmount);

      addLedgerEntry({
        partyId: settleCustomer.id,
        partyName: settleCustomer.name,
        partyType: "CUSTOMER",
        type: "CREDIT",
        amount: settleAmount,
        runningBalance: Math.max(0, settleCustomer.dueBalance - settleAmount),
        referenceNo: settleRef || `REC-${Date.now().toString().slice(-6)}`,
        description: `Payment received via ${settleMethod} (Lena Hai Settlement)`,
      });

      addPaymentRecord({
        billId: custBills[0]?.id || `bill-${Date.now()}`,
        invoiceNo: custBills[0]?.invoiceNo || "DIRECT-REC",
        customerId: settleCustomer.id,
        customerName: settleCustomer.name,
        amount: settleAmount,
        method: settleMethod,
        type: "RECEIVED",
        referenceNo: settleRef || `REC-${Date.now().toString().slice(-6)}`,
      });
    } else {
      recordDenaPayment(settleCustomer.id, settleAmount);

      addLedgerEntry({
        partyId: settleCustomer.id,
        partyName: settleCustomer.name,
        partyType: "CUSTOMER",
        type: "DEBIT",
        amount: settleAmount,
        runningBalance: Math.max(0, (settleCustomer.denaBalance || 0) - settleAmount),
        referenceNo: settleRef || `PAY-${Date.now().toString().slice(-6)}`,
        description: `Payment paid to customer via ${settleMethod} (Dena Hai Settlement)`,
      });

      addPaymentRecord({
        billId: `settle-${Date.now()}`,
        invoiceNo: "DENA-SETTLE",
        customerId: settleCustomer.id,
        customerName: settleCustomer.name,
        amount: settleAmount,
        method: settleMethod,
        type: "PAID",
        referenceNo: settleRef || `PAY-${Date.now().toString().slice(-6)}`,
      });
    }

    setSettleCustomer(null);
    setSettleAmount(0);
    setSettleRef("");
  };

  const filterPills = [
    { id: "all", label: "All Customers", count: summaryMetrics.allCount, color: "text-slate-300" },
    { id: "due", label: "Lena Hai (Dues)", count: summaryMetrics.dueCount, color: "text-rose-400" },
    { id: "dena", label: "Dena Hai (Payables)", count: summaryMetrics.denaCount, color: "text-blue-400" },
    { id: "clear", label: "Clear (No Dues)", count: summaryMetrics.clearCount, color: "text-emerald-400" },
    { id: "vip", label: "VIP (> ₹1 Lakh)", count: summaryMetrics.vipCount, color: "text-gold-400" },
    { id: "gstin", label: "Business GSTIN", count: summaryMetrics.gstinCount, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="👥 Customers & Client CRM"
        subtitle={`Directory of ${customers.length} registered clientele & credit accounts`}
        action={
          <Button variant="gold" onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
            New Customer
          </Button>
        }
      />

      {/* Top 4 Interactive KPI Filter Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: All Customers */}
        <div
          onClick={() => handleFilterSelect("all")}
          className={`glass-panel glass-panel-hover p-4 rounded-2xl border transition-all cursor-pointer group active:scale-98 ${
            filterTab === "all" ? "border-gold-500 bg-gold-500/10 shadow-gold" : "border-gold-500/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-300 tracking-wider">Total Customers</span>
            <div className="p-2 bg-gold-500/10 text-gold-400 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-100 mt-2">{summaryMetrics.allCount}</h3>
          <p className="text-[10px] text-slate-400 mt-1 group-hover:text-gold-400 transition-colors">
            Click to view all registered accounts →
          </p>
        </div>

        {/* Card 2: Lena Hai (Receivables) */}
        <div
          onClick={() => handleFilterSelect("due")}
          className={`glass-panel glass-panel-hover p-4 rounded-2xl border transition-all cursor-pointer group active:scale-98 ${
            filterTab === "due" ? "border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10" : "border-rose-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold uppercase text-rose-400 tracking-wider">Lena Hai (Due)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono font-bold">
                {summaryMetrics.dueCount}
              </span>
            </div>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-rose-300 mt-2">{formatCurrency(summaryMetrics.totalLena)}</h3>
          <p className="text-[10px] text-slate-400 mt-1 group-hover:text-rose-400 transition-colors">
            Click to filter customers with dues →
          </p>
        </div>

        {/* Card 3: Dena Hai (Payables) */}
        <div
          onClick={() => handleFilterSelect("dena")}
          className={`glass-panel glass-panel-hover p-4 rounded-2xl border transition-all cursor-pointer group active:scale-98 ${
            filterTab === "dena" ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10" : "border-blue-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold uppercase text-blue-400 tracking-wider">Dena Hai (Payable)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono font-bold">
                {summaryMetrics.denaCount}
              </span>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-blue-300 mt-2">{formatCurrency(summaryMetrics.totalDena)}</h3>
          <p className="text-[10px] text-slate-400 mt-1 group-hover:text-blue-400 transition-colors">
            Click to filter customers with payables →
          </p>
        </div>

        {/* Card 4: Clear Accounts */}
        <div
          onClick={() => handleFilterSelect("clear")}
          className={`glass-panel glass-panel-hover p-4 rounded-2xl border transition-all cursor-pointer group active:scale-98 ${
            filterTab === "clear" ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10" : "border-emerald-500/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-wider">Clear Accounts</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-300 mt-2">{summaryMetrics.clearCount}</h3>
          <p className="text-[10px] text-slate-400 mt-1 group-hover:text-emerald-400 transition-colors">
            Click to filter zero-balance accounts →
          </p>
        </div>
      </div>

      {/* Global Search Bar & Interactive Filter Pills */}
      <div className="glass-panel p-4 rounded-xl border border-gold-500/15 space-y-3">
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Fast search customer name / mobile (e.g. 8194030901) / GSTIN..."
            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        {/* Filter Pills Toolbar */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar flex-wrap items-center">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-gold-400" /> Filter:
          </span>
          {filterPills.map((pill) => {
            const isActive = filterTab === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handleFilterSelect(pill.id as any)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-gold-500 text-obsidian-950 font-bold shadow-gold scale-105"
                    : "bg-obsidian-900 text-slate-300 border border-gold-500/20 hover:text-gold-400 hover:border-gold-500/40"
                }`}
              >
                <span>{pill.label}</span>
                <span
                  suppressHydrationWarning
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-obsidian-950/20 text-obsidian-950 font-extrabold"
                      : "bg-gold-500/15 text-gold-400 border border-gold-500/20"
                  }`}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact One-Line Search Result Card */}
      {search.trim().length > 0 && filtered.length > 0 && (
        <div className="glass-panel p-3 rounded-xl border border-gold-500/30 bg-gold-500/5 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gold-400">
            Instant Customer Search Match ({filtered.length})
          </span>
          {filtered.slice(0, 3).map((cust) => {
            const custBills = bills.filter((b) => b.customerId === cust.id || b.customerPhone === cust.phone);
            const lastBill = custBills[0];
            return (
              <div
                key={cust.id}
                className="flex flex-wrap items-center justify-between p-2.5 rounded-lg bg-obsidian-900/90 border border-gold-500/20 text-xs gap-2"
              >
                <div className="flex flex-wrap items-center gap-3 font-semibold text-slate-200">
                  <span className="font-extrabold text-slate-100">{cust.name}</span>
                  <span className="text-slate-400 font-mono">| {cust.phone}</span>
                  <button
                    onClick={() => handleOpenSettlement(cust, "RECEIVE_LENA")}
                    className="text-rose-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    title="Click to settle Lena Due"
                  >
                    | Lena {formatCurrency(cust.dueBalance)}
                  </button>
                  <button
                    onClick={() => handleOpenSettlement(cust, "PAY_DENA")}
                    className="text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    title="Click to settle Dena Amount"
                  >
                    | Dena {formatCurrency(cust.denaBalance || 0)}
                  </button>
                  <span className="text-slate-300">| {cust.totalBills} Bills</span>
                  {lastBill && (
                    <span className="text-gold-400">
                      | Last Bill {formatCurrency(lastBill.calculation.grandTotal)} ({formatDate(lastBill.date)} • {formatTime(lastBill.date)})
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenSettlement(cust, "RECEIVE_LENA")}
                    icon={<DollarSign className="w-3.5 h-3.5 text-emerald-400" />}
                  >
                    PAYMENT
                  </Button>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => setSelectedDrawerCustomer(cust)}
                    icon={<History className="w-3.5 h-3.5" />}
                  >
                    HISTORY
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Master Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Customer</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>GSTIN</TableCell>
            <TableCell>Total Bills</TableCell>
            <TableCell>Lifetime Spent</TableCell>
            <TableCell>
              <button
                onClick={() => handleFilterSelect(filterTab === "due" ? "all" : "due")}
                className="font-extrabold hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                title="Click to filter by Lena Hai Dues"
              >
                Lena Hai (Receivable)
              </button>
            </TableCell>
            <TableCell>
              <button
                onClick={() => handleFilterSelect(filterTab === "dena" ? "all" : "dena")}
                className="font-extrabold hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                title="Click to filter by Dena Hai Payables"
              >
                Dena Hai (Payable)
              </button>
            </TableCell>
            <TableCell>Last Transaction</TableCell>
            <TableCell className="text-right">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCustomers.map((cust) => {
            const custBills = bills.filter((b) => b.customerId === cust.id || b.customerPhone === cust.phone);
            const lastBill = custBills[0];
            const denaAmount = cust.denaBalance || 0;

            return (
              <TableRow key={cust.id}>
                <TableCell>
                  <button
                    onClick={() => setSelectedDrawerCustomer(cust)}
                    className="font-bold text-slate-100 hover:text-gold-400 hover:underline cursor-pointer text-left"
                  >
                    {cust.name}
                  </button>
                </TableCell>
                <TableCell className="text-xs text-slate-300 font-mono">{cust.phone}</TableCell>
                <TableCell className="text-xs text-slate-400">{cust.gstin || "-"}</TableCell>
                <TableCell className="font-mono text-slate-200">{cust.totalBills} Bills</TableCell>
                <TableCell className="font-bold text-emerald-400">{formatCurrency(cust.totalSpent)}</TableCell>

                {/* Lena Hai Clickable Badge */}
                <TableCell>
                  <button
                    onClick={() => handleOpenSettlement(cust, "RECEIVE_LENA")}
                    className="inline-flex items-center focus:outline-none cursor-pointer group"
                    title="Click to receive Lena payment"
                  >
                    {cust.dueBalance > 0 ? (
                      <Badge variant="due" className="hover:scale-105 transition-transform hover:shadow-md cursor-pointer">
                        {formatCurrency(cust.dueBalance)} Due
                      </Badge>
                    ) : (
                      <Badge variant="paid" className="hover:scale-105 transition-transform cursor-pointer">
                        Clear
                      </Badge>
                    )}
                  </button>
                </TableCell>

                {/* Dena Hai Clickable Badge */}
                <TableCell>
                  <button
                    onClick={() => handleOpenSettlement(cust, "PAY_DENA")}
                    className="inline-flex items-center focus:outline-none cursor-pointer group"
                    title="Click to pay Dena balance"
                  >
                    {denaAmount > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:scale-105 transition-transform hover:bg-blue-500/30 cursor-pointer">
                        {formatCurrency(denaAmount)} Dena
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-slate-400 font-bold hover:text-blue-400 transition-colors cursor-pointer">
                        ₹0
                      </span>
                    )}
                  </button>
                </TableCell>

                <TableCell className="text-xs text-slate-400">
                  {lastBill ? `${formatDate(lastBill.date)} • ${formatTime(lastBill.date)}` : formatDate(cust.createdAt)}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenSettlement(cust, "RECEIVE_LENA")}
                      icon={<DollarSign className="w-3.5 h-3.5 text-emerald-400" />}
                      title="Quick Settlement"
                    >
                      Pay
                    </Button>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => setSelectedDrawerCustomer(cust)}
                      icon={<History className="w-3.5 h-3.5" />}
                    >
                      History
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between glass-panel p-3 rounded-xl border border-gold-500/15 text-xs">
          <span className="text-slate-400" suppressHydrationWarning>
            Showing Page <strong className="text-slate-200">{currentPage}</strong> of{" "}
            <strong className="text-slate-200">{totalPages}</strong> ({filtered.length} total customers)
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Quick Settlement Modal for Lena & Dena */}
      {settleCustomer && (
        <Modal
          isOpen={!!settleCustomer}
          onClose={() => setSettleCustomer(null)}
          title={`💳 Settlement & Payment - ${settleCustomer.name}`}
        >
          <form onSubmit={handleSaveSettlement} className="space-y-4">
            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 bg-obsidian-900 p-1.5 rounded-xl border border-gold-500/20">
              <button
                type="button"
                onClick={() => {
                  setSettleMode("RECEIVE_LENA");
                  setSettleAmount(settleCustomer.dueBalance > 0 ? settleCustomer.dueBalance : 500);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  settleMode === "RECEIVE_LENA"
                    ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Receive Lena (₹{settleCustomer.dueBalance})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSettleMode("PAY_DENA");
                  setSettleAmount((settleCustomer.denaBalance || 0) > 0 ? (settleCustomer.denaBalance || 0) : 3000);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  settleMode === "PAY_DENA"
                    ? "bg-blue-500 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Pay Dena (₹{settleCustomer.denaBalance || 0})</span>
              </button>
            </div>

            {/* Dynamic Calculation Summary Card */}
            {settleMode === "RECEIVE_LENA" ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Current Lena Due:</span>
                  <span className="font-extrabold text-emerald-400">{formatCurrency(settleCustomer.dueBalance)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Receiving Amount:</span>
                  <span className="font-extrabold text-emerald-300">{formatCurrency(settleAmount || 0)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-slate-100 border-t border-emerald-500/20 pt-1">
                  <span>New Lena Due After Payment:</span>
                  <span className="text-emerald-400">
                    {formatCurrency(Math.max(0, settleCustomer.dueBalance - (settleAmount || 0)))}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Current Dena Balance:</span>
                  <span className="font-extrabold text-blue-400">{formatCurrency(settleCustomer.denaBalance || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Paying Amount:</span>
                  <span className="font-extrabold text-blue-300">{formatCurrency(settleAmount || 0)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-slate-100 border-t border-blue-500/20 pt-1">
                  <span>New Dena Balance After Payment:</span>
                  <span className="text-blue-400">
                    {formatCurrency(Math.max(0, (settleCustomer.denaBalance || 0) - (settleAmount || 0)))}
                  </span>
                </div>
              </div>
            )}

            <Input
              label={settleMode === "RECEIVE_LENA" ? "Received Amount (₹) *" : "Amount Paid to Customer (₹) *"}
              type="number"
              value={settleAmount || ""}
              onChange={(e) => setSettleAmount(Number(e.target.value))}
              placeholder={settleMode === "RECEIVE_LENA" ? "e.g. 500" : "e.g. 3000"}
              required
            />

            <Select
              label="Payment Method"
              value={settleMethod}
              onChange={(e) => setSettleMethod(e.target.value as any)}
              options={[
                { label: "UPI / QR Code", value: "UPI" },
                { label: "Cash", value: "CASH" },
                { label: "Card", value: "CARD" },
                { label: "Bank Transfer", value: "BANK_TRANSFER" },
              ]}
            />

            <Input
              label="Reference # / Remarks (Optional)"
              value={settleRef}
              onChange={(e) => setSettleRef(e.target.value)}
              placeholder="e.g. UPI/Transaction Ref"
            />

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" onClick={() => setSettleCustomer(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant={settleMode === "RECEIVE_LENA" ? "gold" : "primary"}
                type="submit"
                className="flex-1 font-bold"
              >
                {settleMode === "RECEIVE_LENA"
                  ? `Save Received (${formatCurrency(settleAmount)})`
                  : `Save Paid (${formatCurrency(settleAmount)})`}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Customer Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register Customer">
        <form onSubmit={handleSaveCustomer} className="space-y-3">
          <Input label="Customer Name *" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 8194030901" required />
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="gold" type="submit" className="flex-1">
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complete Customer Account Drawer & History */}
      <CustomerAccountDrawer
        customer={selectedDrawerCustomer}
        isOpen={!!selectedDrawerCustomer}
        onClose={() => setSelectedDrawerCustomer(null)}
      />
    </div>
  );
}
