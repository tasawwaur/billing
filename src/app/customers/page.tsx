"use client";

import React, { useState, useMemo, useDeferredValue, useCallback } from "react";
import { useCustomerStore } from "@/store/customer-store";
import { useBillingStore } from "@/store/billing-store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { CustomerAccountDrawer } from "@/components/customers/CustomerAccountDrawer";
import { Plus, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/currency";
import { Customer } from "@/types/customer";

const PAGE_SIZE = 25;

export default function CustomersPage() {
  const customers = useCustomerStore((state) => state.customers);
  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const bills = useBillingStore((state) => state.bills);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDrawerCustomer, setSelectedDrawerCustomer] = useState<Customer | null>(null);

  // New customer form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.phone.replace("+91", "").includes(query)
    );
  }, [customers, deferredSearch]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

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

      {/* Global Customer Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-gold-500/15 max-w-xl">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Fast search customer name / mobile (e.g. 8194030901) / invoice..."
            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-gold-500 transition-colors"
          />
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
                  <span className="text-rose-400 font-bold">| Lena {formatCurrency(cust.dueBalance)}</span>
                  <span className="text-blue-400 font-bold">| Dena ₹0</span>
                  <span className="text-slate-300">| {cust.totalBills} Bills</span>
                  {lastBill && (
                    <span className="text-gold-400">
                      | Last Bill {formatCurrency(lastBill.calculation.grandTotal)} ({formatDate(lastBill.date)} • {formatTime(lastBill.date)})
                    </span>
                  )}
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setSelectedDrawerCustomer(cust)}
                  icon={<Eye className="w-3.5 h-3.5" />}
                >
                  VIEW ACCOUNT
                </Button>
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
            <TableCell>Lena Hai</TableCell>
            <TableCell>Dena Hai</TableCell>
            <TableCell>Last Transaction</TableCell>
            <TableCell className="text-right">Action</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCustomers.map((cust) => {
            const custBills = bills.filter((b) => b.customerId === cust.id || b.customerPhone === cust.phone);
            const lastBill = custBills[0];
            return (
              <TableRow key={cust.id}>
                <TableCell className="font-bold text-slate-100">{cust.name}</TableCell>
                <TableCell className="text-xs text-slate-300 font-mono">{cust.phone}</TableCell>
                <TableCell className="text-xs text-slate-400">{cust.gstin || "-"}</TableCell>
                <TableCell className="font-mono text-slate-200">{cust.totalBills} Bills</TableCell>
                <TableCell className="font-bold text-emerald-400">{formatCurrency(cust.totalSpent)}</TableCell>
                <TableCell>
                  {cust.dueBalance > 0 ? (
                    <Badge variant="due">{formatCurrency(cust.dueBalance)} Due</Badge>
                  ) : (
                    <Badge variant="paid">Clear</Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-blue-400 font-bold">₹0</TableCell>
                <TableCell className="text-xs text-slate-400">
                  {lastBill ? `${formatDate(lastBill.date)} • ${formatTime(lastBill.date)}` : formatDate(cust.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDrawerCustomer(cust)}
                    icon={<Eye className="w-3.5 h-3.5" />}
                  >
                    VIEW ACCOUNT
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between glass-panel p-3 rounded-xl border border-gold-500/15 text-xs">
          <span className="text-slate-400">
            Page <strong className="text-slate-200">{currentPage}</strong> of{" "}
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

      {/* Complete Customer Account Drawer */}
      <CustomerAccountDrawer
        customer={selectedDrawerCustomer}
        isOpen={!!selectedDrawerCustomer}
        onClose={() => setSelectedDrawerCustomer(null)}
      />
    </div>
  );
}
