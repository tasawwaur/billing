"use client";

import React, { useState } from "react";
import {
  Bell,
  Search,
  PlusCircle,
  RotateCcw,
  ChevronDown,
  User,
  Package,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSettingsStore } from "@/store/settings-store";
import { useBillingStore } from "@/store/billing-store";
import { useProductStore } from "@/store/product-store";
import { useCustomerStore } from "@/store/customer-store";
import { useLedgerStore } from "@/store/ledger-store";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/currency";

export const Topbar: React.FC = () => {
  const router = useRouter();
  const { settings } = useSettingsStore();
  const { bills, resetBills } = useBillingStore();
  const { products, resetProducts } = useProductStore();
  const { customers, resetCustomers } = useCustomerStore();
  const { resetLedger } = useLedgerStore();

  const [globalSearch, setGlobalSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const matchedCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(globalSearch.toLowerCase()) || c.phone.includes(globalSearch)
  ).slice(0, 3);

  const matchedProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(globalSearch.toLowerCase()) ||
      p.barcode.includes(globalSearch)
  ).slice(0, 3);

  const matchedBills = bills.filter(
    (b) =>
      b.invoiceNo.toLowerCase().includes(globalSearch.toLowerCase()) ||
      b.customerName.toLowerCase().includes(globalSearch.toLowerCase())
  ).slice(0, 3);

  const hasSearchQuery = globalSearch.trim().length > 0;

  const handleResetDemoData = () => {
    if (confirm("Are you sure you want to reset all demo data (Bills, Products, Customers, Ledger) to original initial state?")) {
      resetBills();
      resetProducts();
      resetCustomers();
      resetLedger();
      alert("Demo data successfully restored to fresh initial state!");
    }
  };

  return (
    <header className="h-16 bg-obsidian-950/90 border-b border-gold-500/15 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Store Name / Grouped Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <h1 className="text-sm font-bold tracking-wider uppercase text-slate-100 hidden sm:block whitespace-nowrap">
          ✦ <span className="gold-gradient-text">{settings.storeName}</span>
        </h1>
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search customers, products, invoices or mobile (e.g. 8194030901)..."
            className="w-full bg-obsidian-900/90 border border-gold-500/20 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-gold-500"
          />

          {/* Grouped Live Search Results Popup */}
          {hasSearchQuery && (
            <div className="absolute left-0 right-0 mt-2 glass-panel border border-gold-500/30 rounded-2xl shadow-glass p-3 z-50 text-xs space-y-3 max-h-96 overflow-y-auto">
              {/* Customers Group */}
              {matchedCustomers.length > 0 && (
                <div>
                  <span className="text-[10px] font-extrabold text-gold-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <User className="w-3 h-3" /> Customers
                  </span>
                  <div className="space-y-1">
                    {matchedCustomers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setGlobalSearch("");
                          router.push(`/customers?search=${encodeURIComponent(c.phone)}`);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-obsidian-900/80 hover:bg-obsidian-800 flex justify-between items-center"
                      >
                        <span className="font-bold text-slate-100">{c.name} ({c.phone})</span>
                        <span className="text-[10px] font-bold text-rose-400">Due: {formatCurrency(c.dueBalance)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Group */}
              {matchedProducts.length > 0 && (
                <div>
                  <span className="text-[10px] font-extrabold text-gold-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Package className="w-3 h-3" /> Products
                  </span>
                  <div className="space-y-1">
                    {matchedProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setGlobalSearch("");
                          router.push(`/products?search=${encodeURIComponent(p.sku)}`);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-obsidian-900/80 hover:bg-obsidian-800 flex justify-between items-center"
                      >
                        <div>
                          <span className="font-bold text-slate-100 block">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                        </div>
                        <span className="font-extrabold text-gold-300">{formatCurrency(p.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices Group */}
              {matchedBills.length > 0 && (
                <div>
                  <span className="text-[10px] font-extrabold text-gold-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                    <FileText className="w-3 h-3" /> Invoices
                  </span>
                  <div className="space-y-1">
                    {matchedBills.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setGlobalSearch("");
                          router.push(`/billing/${b.id}`);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-obsidian-900/80 hover:bg-obsidian-800 flex justify-between items-center"
                      >
                        <div>
                          <span className="font-mono font-bold text-gold-400 block">{b.invoiceNo}</span>
                          <span className="text-[10px] text-slate-400">{b.customerName}</span>
                        </div>
                        <span className="font-bold text-slate-100">{formatCurrency(b.calculation.grandTotal)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedCustomers.length === 0 && matchedProducts.length === 0 && matchedBills.length === 0 && (
                <p className="text-center py-4 text-slate-400">No matching record found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <Link href="/billing">
          <Button variant="gold" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
            New Bill
          </Button>
        </Link>

        <button
          onClick={handleResetDemoData}
          title="Restore Initial Demo Data"
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-obsidian-900 border border-gold-500/20 text-slate-300 hover:text-gold-400 hover:border-gold-500/40 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="relative p-2 rounded-lg text-slate-400 hover:text-gold-400 hover:bg-obsidian-900 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-400 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-400" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-72 glass-panel border border-gold-500/30 rounded-2xl shadow-glass p-3 z-50 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gold-500/20 font-bold text-slate-200">
                <span>Notifications</span>
                <span className="text-[10px] text-gold-400">3 New</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2 bg-obsidian-900/80 rounded border border-gold-500/10">
                  <p className="font-semibold text-emerald-400">Bill INV-2026-00310 Generated</p>
                  <p className="text-[10px] text-slate-400">₹2,450 paid via UPI by Rahul Sharma</p>
                </div>
                <div className="p-2 bg-obsidian-900/80 rounded border border-gold-500/10">
                  <p className="font-semibold text-amber-400">Low Stock Alert</p>
                  <p className="text-[10px] text-slate-400">Nautilus Steel Blue Dial (1 left)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg border border-gold-500/20 bg-obsidian-900 hover:border-gold-500/40 text-xs"
          >
            <div className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-[10px]">
              AD
            </div>
            <span className="font-semibold text-slate-200 hidden sm:inline">Admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-48 glass-panel border border-gold-500/30 rounded-2xl shadow-glass p-2 z-50 text-xs">
              <div className="p-2 border-b border-gold-500/15">
                <p className="font-bold text-slate-100">Store Manager</p>
                <p className="text-[10px] text-slate-400">admin@luxurystore.com</p>
              </div>
              <Link href="/settings" className="block px-3 py-2 hover:bg-obsidian-900 text-slate-300 rounded-lg">
                Store Settings
              </Link>
              <Link href="/bill-design" className="block px-3 py-2 hover:bg-obsidian-900 text-slate-300 rounded-lg">
                Bill Design Studio
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
