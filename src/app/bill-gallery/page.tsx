"use client";

import React, { useState, useMemo, useDeferredValue, useCallback } from "react";
import { useBillingStore } from "@/store/billing-store";
import { useSettingsStore } from "@/store/settings-store";
import { useCustomerStore } from "@/store/customer-store";
import { useLedgerStore } from "@/store/ledger-store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BillTemplateA4 } from "@/components/bills/BillTemplateA4";
import { CustomerAccountDrawer } from "@/components/customers/CustomerAccountDrawer";
import { sendInvoiceWhatsApp } from "@/lib/whatsapp";
import { downloadInvoiceAsImage } from "@/lib/image-export";
import { formatCurrency, formatDate } from "@/lib/currency";
import { Bill } from "@/types/bill";
import { Customer } from "@/types/customer";
import {
  Search,
  Eye,
  Printer,
  Share2,
  MessageCircle,
  XCircle,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 25;

export default function BillGalleryPage() {
  const bills = useBillingStore((state) => state.bills);
  const cancelBill = useBillingStore((state) => state.cancelBill);
  const settings = useSettingsStore((state) => state.settings);
  const customers = useCustomerStore((state) => state.customers);
  const recordPayment = useCustomerStore((state) => state.recordPayment);
  const addLedgerEntry = useLedgerStore((state) => state.addLedgerEntry);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [billToCancel, setBillToCancel] = useState<Bill | null>(null);
  const [selectedCustForAccount, setSelectedCustForAccount] = useState<Customer | null>(null);

  const dates = useMemo(() => {
    const now = new Date();
    return {
      todayStr: now.toISOString().split("T")[0],
      sevenDaysAgo: now.getTime() - 7 * 24 * 60 * 60 * 1000,
      thirtyDaysAgo: now.getTime() - 30 * 24 * 60 * 60 * 1000,
    };
  }, []);

  const handleOpenCustomerAccount = (custName: string, custId: string) => {
    const matched = customers.find((c) => c.id === custId || c.name.toLowerCase() === custName.toLowerCase());
    if (matched) {
      setSelectedCustForAccount(matched);
    }
  };

  // Optimized Memoized Filter
  const filteredBills = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    const { todayStr, sevenDaysAgo, thirtyDaysAgo } = dates;

    return bills.filter((bill) => {
      const matchesSearch =
        !query ||
        bill.invoiceNo.toLowerCase().includes(query) ||
        bill.customerName.toLowerCase().includes(query) ||
        bill.customerPhone.includes(query) ||
        bill.items.some((i) => i.productName.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (filterStatus === "paid") return bill.paymentStatus === "PAID";
      if (filterStatus === "due") return bill.paymentStatus === "DUE" || bill.calculation.dueAmount > 0;
      if (filterStatus === "partial") return bill.paymentStatus === "PARTIAL";
      if (filterStatus === "cancelled") return bill.paymentStatus === "CANCELLED";
      if (filterStatus === "gst") return bill.calculation.totalTax > 0;
      if (filterStatus === "thermal") return bill.templateId.includes("thermal");
      if (filterStatus === "a4") return !bill.templateId.includes("thermal");
      if (filterStatus === "today") return bill.date.startsWith(todayStr);
      if (filterStatus === "this_week") return new Date(bill.date).getTime() >= sevenDaysAgo;
      if (filterStatus === "this_month") return new Date(bill.date).getTime() >= thirtyDaysAgo;

      return true;
    });
  }, [bills, deferredSearch, filterStatus, dates]);

  // Memoized Counts for Filter Pills
  const counts = useMemo(() => {
    const { todayStr, sevenDaysAgo, thirtyDaysAgo } = dates;
    const res: Record<string, number> = {
      all: bills.length,
      paid: 0,
      due: 0,
      partial: 0,
      cancelled: 0,
      gst: 0,
      a4: 0,
      thermal: 0,
      today: 0,
      this_week: 0,
      this_month: 0,
    };

    for (let i = 0; i < bills.length; i++) {
      const b = bills[i];
      if (b.paymentStatus === "PAID") res.paid++;
      if (b.paymentStatus === "DUE" || b.calculation.dueAmount > 0) res.due++;
      if (b.paymentStatus === "PARTIAL") res.partial++;
      if (b.paymentStatus === "CANCELLED") res.cancelled++;
      if (b.calculation.totalTax > 0) res.gst++;
      if (b.templateId.includes("thermal")) res.thermal++;
      else res.a4++;
      
      const bTime = new Date(b.date).getTime();
      if (b.date.startsWith(todayStr)) res.today++;
      if (bTime >= sevenDaysAgo) res.this_week++;
      if (bTime >= thirtyDaysAgo) res.this_month++;
    }

    return res;
  }, [bills, dates]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredBills.length / PAGE_SIZE) || 1;
  const paginatedBills = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBills.slice(start, start + PAGE_SIZE);
  }, [filteredBills, currentPage]);

  const handleFilterChange = useCallback((id: string) => {
    setFilterStatus(id);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleConfirmCancel = useCallback(() => {
    if (!billToCancel) return;
    const cancelled = cancelBill(billToCancel.id);
    if (cancelled) {
      if (cancelled.calculation.dueAmount > 0) {
        recordPayment(cancelled.customerId, -cancelled.calculation.dueAmount);
      }
      addLedgerEntry({
        partyId: cancelled.customerId,
        partyName: cancelled.customerName,
        partyType: "CUSTOMER",
        type: "CREDIT",
        amount: cancelled.calculation.grandTotal,
        runningBalance: 0,
        referenceNo: `REV-${cancelled.invoiceNo}`,
        description: `Invoice cancellation reversal for ${cancelled.invoiceNo}`,
      });
    }
    setBillToCancel(null);
  }, [billToCancel, cancelBill, recordPayment, addLedgerEntry]);

  const handleShare = useCallback(async (bill: Bill) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${bill.invoiceNo}`,
          text: `Invoice ${bill.invoiceNo} from ${settings.storeName} for ₹${bill.calculation.grandTotal}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      sendInvoiceWhatsApp(bill, settings);
    }
  }, [settings]);

  const filtersList = [
    { id: "all", label: "All Bills" },
    { id: "paid", label: "Paid" },
    { id: "due", label: "Due Dues" },
    { id: "partial", label: "Partial" },
    { id: "cancelled", label: "Cancelled" },
    { id: "gst", label: "GST Tax" },
    { id: "a4", label: "A4 Format" },
    { id: "thermal", label: "POS Thermal" },
    { id: "today", label: "Today" },
    { id: "this_week", label: "This Week" },
    { id: "this_month", label: "This Month" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="🖼️ Bill Gallery & Dynamic Archive"
        subtitle={`Real-time repository of ${bills.length} generated invoice records`}
      />

      {/* Search & Fast Filters */}
      <div className="flex flex-col gap-4 glass-panel p-4 rounded-xl border border-gold-500/15">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Fast search INV #, Customer, Mobile or Product..."
            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar flex-wrap">
          {filtersList.map((f) => {
            const count = counts[f.id] || 0;
            const isActive = filterStatus === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFilterChange(f.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-gold-500 text-obsidian-950 font-bold shadow-gold scale-105"
                    : "bg-obsidian-900 text-slate-300 border border-gold-500/20 hover:text-gold-400 hover:border-gold-500/40"
                }`}
              >
                <span>{f.label}</span>
                <span
                  suppressHydrationWarning
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-obsidian-950/20 text-obsidian-950 font-extrabold"
                      : "bg-gold-500/15 text-gold-400 border border-gold-500/20"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Invoice Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Invoice #</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Items</TableCell>
            <TableCell>Grand Total</TableCell>
            <TableCell>Payment Mode</TableCell>
            <TableCell>Status</TableCell>
            <TableCell className="text-right">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedBills.map((bill) => (
            <TableRow key={bill.id}>
              <TableCell>
                <button
                  onClick={() => setSelectedBill(bill)}
                  className="font-mono font-bold text-gold-400 hover:text-gold-300 hover:underline text-left cursor-pointer"
                >
                  {bill.invoiceNo}
                </button>
              </TableCell>
              <TableCell className="text-xs text-slate-400">{formatDate(bill.date)}</TableCell>
              <TableCell>
                <button
                  onClick={() => handleOpenCustomerAccount(bill.customerName, bill.customerId)}
                  className="font-bold text-slate-100 hover:text-gold-400 hover:underline cursor-pointer text-left block"
                >
                  {bill.customerName}
                </button>
                <span className="text-[10px] text-slate-400 font-mono">{bill.customerPhone}</span>
              </TableCell>
              <TableCell className="text-xs text-slate-300">
                {bill.items.length} item(s)
              </TableCell>
              <TableCell className="font-extrabold text-slate-100">
                {formatCurrency(bill.calculation.grandTotal)}
              </TableCell>
              <TableCell className="text-xs text-slate-300">{bill.paymentMethod}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    bill.paymentStatus === "PAID"
                      ? "paid"
                      : bill.paymentStatus === "CANCELLED"
                      ? "neutral"
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => sendInvoiceWhatsApp(bill, settings)}
                  icon={<MessageCircle className="w-3.5 h-3.5 text-emerald-400" />}
                >
                  WhatsApp
                </Button>
                {bill.paymentStatus !== "CANCELLED" && (
                  <button
                    onClick={() => setBillToCancel(bill)}
                    title="Cancel Invoice & Reverse Stock"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between glass-panel p-3 rounded-xl border border-gold-500/15 text-xs">
          <span className="text-slate-400" suppressHydrationWarning>
            Showing Page <strong className="text-slate-200">{currentPage}</strong> of{" "}
            <strong className="text-slate-200">{totalPages}</strong> ({filteredBills.length} total records)
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

      {/* Bill Preview Modal */}
      {selectedBill && (
        <Modal
          isOpen={!!selectedBill}
          onClose={() => setSelectedBill(null)}
          title={`Tax Invoice - ${selectedBill.invoiceNo}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-end">
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
                onClick={() => handleShare(selectedBill)}
                icon={<Share2 className="w-4 h-4" />}
              >
                Share
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
                Print / Save PDF
              </Button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto rounded-xl border border-slate-200">
              <BillTemplateA4 bill={selectedBill} settings={settings} />
            </div>
          </div>
        </Modal>
      )}

      {/* Cancellation Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!billToCancel}
        onClose={() => setBillToCancel(null)}
        onConfirm={handleConfirmCancel}
        title="Confirm Invoice Cancellation"
        message={`Are you sure you want to cancel ${billToCancel?.invoiceNo}? This action will immediately reverse product inventory stock and adjust the customer ledger.`}
        confirmText="Cancel Invoice"
      />

      {/* Customer Account Drawer */}
      {selectedCustForAccount && (
        <CustomerAccountDrawer
          customer={selectedCustForAccount}
          isOpen={!!selectedCustForAccount}
          onClose={() => setSelectedCustForAccount(null)}
        />
      )}
    </div>
  );
}
