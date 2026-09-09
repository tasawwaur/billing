"use client";

import React, { useState } from "react";
import { Customer } from "@/types/customer";
import { useCustomerStore } from "@/store/customer-store";
import { useLedgerStore } from "@/store/ledger-store";
import { User, Plus, Clock, CheckCircle2, Banknote, QrCode, CreditCard, ArrowDownLeft, X, MessageCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/currency";

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomerId: string;
  selectedCustomerName?: string;
  selectedCustomerPhone?: string;
  onSelectCustomer: (customer: Customer) => void;
  onUpdateCustomerInfo?: (name: string, phone: string) => void;
  onAddCustomer: (c: Omit<Customer, "id" | "totalBills" | "totalSpent" | "dueBalance" | "createdAt">) => Customer;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customers,
  selectedCustomerId,
  selectedCustomerName,
  selectedCustomerPhone,
  onSelectCustomer,
  onUpdateCustomerInfo,
  onAddCustomer,
}) => {
  const { recordPayment } = useCustomerStore();
  const { addLedgerEntry, addPaymentRecord } = useLedgerStore();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDueModal, setShowDueModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number | "">("");
  const [payMethod, setPayMethod] = useState<"CASH" | "UPI" | "CARD" | "BANK_TRANSFER">("CASH");
  const [payNote, setPayNote] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Add Customer Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");

  const selectedCustomer = selectedCustomerId
    ? customers.find((c) => c.id === selectedCustomerId) || null
    : null;

  const currentDue = selectedCustomer?.dueBalance || 0;
  const numPayAmount = typeof payAmount === "number" ? payAmount : 0;
  const remainingDueAfterPay = Math.max(0, currentDue - numPayAmount);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    const newCust = onAddCustomer({ name, phone, email, address, gstin });
    onSelectCustomer(newCust);
    setShowAddModal(false);
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setGstin("");
  };

  const handleOpenDueModal = () => {
    if (!selectedCustomer || currentDue <= 0) return;
    setPayAmount(currentDue); // Default to full clearance
    setPayNote("");
    setShowDueModal(true);
  };

  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || numPayAmount <= 0) return;

    // 1. Minus the paid amount from customer's dueBalance
    recordPayment(selectedCustomer.id, numPayAmount);

    const ref = payNote || `REC-${Date.now().toString().slice(-6)}`;

    // 2. Add Credit Ledger Entry
    addLedgerEntry({
      partyId: selectedCustomer.id,
      partyName: selectedCustomer.name,
      partyType: "CUSTOMER",
      type: "CREDIT",
      amount: numPayAmount,
      runningBalance: remainingDueAfterPay,
      referenceNo: ref,
      description: `Due payment received via ${payMethod} (Khata Vasooli)`,
    });

    // 3. Add Payment Record
    addPaymentRecord({
      billId: `settle-${Date.now()}`,
      invoiceNo: ref,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      amount: numPayAmount,
      method: payMethod,
      type: "RECEIVED",
      referenceNo: ref,
    });

    setShowDueModal(false);
    setToastMsg(`₹${numPayAmount} received from ${selectedCustomer.name}. Remaining Due: ${formatCurrency(remainingDueAfterPay)}`);
  };

  return (
    <div className="glass-panel p-3.5 rounded-xl border border-gold-500/20">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gold-400 flex items-center gap-1">
          <User className="w-3.5 h-3.5" /> Customer Tagging
        </span>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-[10px] font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Quick Add Customer
        </button>
      </div>

      <div className="flex items-center justify-between bg-obsidian-900/90 p-2.5 rounded-lg border border-gold-500/15" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <p className="text-xs font-bold text-slate-100" suppressHydrationWarning>
            {selectedCustomerName || (selectedCustomer && selectedCustomer.id ? selectedCustomer.name : "Walk-in / Cash Customer")}
          </p>
          <p className="text-[10px] text-slate-400" suppressHydrationWarning>
            {selectedCustomerPhone || (selectedCustomer && selectedCustomer.id ? selectedCustomer.phone : "Direct Counter Sale")}
          </p>
        </div>

        {/* Due button or Standard Sale indicator */}
        {currentDue > 0 ? (
          <button
            type="button"
            onClick={handleOpenDueModal}
            className="group text-[11px] font-extrabold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1 rounded-lg border border-rose-500/40 flex items-center gap-1.5 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
            title="Click to minus due / receive payment"
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse group-hover:scale-125 transition-transform" />
            <span>Due: {formatCurrency(currentDue)}</span>
            <span className="text-[9px] font-bold bg-rose-950 text-rose-200 px-1.5 py-0.5 rounded border border-rose-500/40 ml-0.5 group-hover:bg-rose-900 transition-colors">
              Minus / Pay ✎
            </span>
          </button>
        ) : (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Standard Sale
          </span>
        )}
      </div>

      {/* Customer Quick Switcher */}
      <div className="mt-2 relative">
        <select
          value={selectedCustomerId}
          onChange={(e) => {
            if (!e.target.value) {
              onSelectCustomer({
                id: "",
                name: "",
                phone: "",
                dueBalance: 0,
                denaBalance: 0,
                totalBills: 0,
                totalSpent: 0,
                createdAt: "",
              });
              return;
            }
            const found = customers.find((c) => c.id === e.target.value);
            if (found) onSelectCustomer(found);
          }}
          className="w-full bg-obsidian-950 text-slate-200 border border-gold-500/15 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gold-500"
        >
          <option value="" className="bg-obsidian-900 text-slate-200">
            Walk-in / Cash Customer (Direct)
          </option>
          {filtered.slice(0, 40).map((c) => (
            <option key={c.id} value={c.id} className="bg-obsidian-900 text-slate-200">
              {c.name} ({c.phone}) {c.dueBalance > 0 ? `- Due ${formatCurrency(c.dueBalance)}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Direct Editable Name & WhatsApp Number on POS Screen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-gold-500/15">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
            <User className="w-3 h-3 text-gold-400" />
            Customer Name:
          </label>
          <input
            type="text"
            value={selectedCustomerName || ""}
            onChange={(e) => {
              onUpdateCustomerInfo?.(e.target.value, selectedCustomerPhone || "");
            }}
            placeholder="Enter Customer Name (e.g. TASAVVUR)..."
            className="w-full bg-obsidian-950 text-slate-100 font-bold border border-gold-500/20 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gold-400 placeholder:text-slate-500"
            title="Enter customer name (or leave empty for Walk-in)"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            <MessageCircle className="w-3 h-3 text-emerald-400" />
            WhatsApp Mobile:
          </label>
          <input
            type="tel"
            value={selectedCustomerPhone || ""}
            onChange={(e) => {
              onUpdateCustomerInfo?.(selectedCustomerName || "", e.target.value);
            }}
            placeholder="Enter Mobile (e.g. 08194030901)..."
            className="w-full bg-obsidian-950 text-emerald-300 font-bold font-mono border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-400 placeholder:text-slate-500"
            title="Enter mobile number - bill will be sent directly to this number on WhatsApp"
          />
        </div>
      </div>

      {selectedCustomerPhone && selectedCustomerPhone.trim() !== "" ? (
        <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>
            Bill bante hi is number (<strong>{selectedCustomerPhone}</strong>) par WhatsApp auto-send hoga.
          </span>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-400 text-[10px]">
          <MessageCircle className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Mobile number daalein taaki bill generate hote hi WhatsApp chala jaye.</span>
        </div>
      )}

      {/* 1. Due Payment Collection & Minus Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={showDueModal}
          onClose={() => setShowDueModal(false)}
          title={`💰 Collect Payment & Minus Due - ${selectedCustomer.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleCollectPayment} className="space-y-4">
            {/* Customer Details & Total Due */}
            <div className="p-4 rounded-xl bg-obsidian-900/90 border border-gold-500/20 flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-slate-100">{selectedCustomer.name}</p>
                <p className="text-xs text-slate-400">{selectedCustomer.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Kul Baaki Udhar (Total Due)</span>
                <span className="text-lg font-extrabold text-rose-400 font-mono">
                  {formatCurrency(currentDue)}
                </span>
              </div>
            </div>

            {/* Input: Amount Paid by Customer */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex justify-between items-center">
                <span>Grahak Ne Kitne Paise Diye? (Amount Paid) *</span>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  Settle / Minus Karein
                </span>
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400 font-bold text-base">₹</span>
                <input
                  type="number"
                  min="1"
                  max={currentDue}
                  step="any"
                  value={payAmount}
                  placeholder={`Max ${currentDue}`}
                  onChange={(e) => {
                    const val = e.target.value === "" ? "" : Number(e.target.value);
                    setPayAmount(val);
                  }}
                  required
                  autoFocus
                  className="w-full bg-obsidian-950 border border-gold-500/30 rounded-xl py-2.5 pl-8 pr-3 text-base font-extrabold text-gold-300 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                />
              </div>

              {/* Quick Shortcut Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPayAmount(currentDue)}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                >
                  Full Settle ({formatCurrency(currentDue)})
                </button>
                {currentDue > 500 && (
                  <button
                    type="button"
                    onClick={() => setPayAmount(500)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-obsidian-900 text-slate-300 border border-gold-500/20 hover:text-gold-300"
                  >
                    ₹500
                  </button>
                )}
                {currentDue > 1000 && (
                  <button
                    type="button"
                    onClick={() => setPayAmount(1000)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-obsidian-900 text-slate-300 border border-gold-500/20 hover:text-gold-300"
                  >
                    ₹1,000
                  </button>
                )}
                {currentDue > 2000 && (
                  <button
                    type="button"
                    onClick={() => setPayAmount(2000)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-obsidian-900 text-slate-300 border border-gold-500/20 hover:text-gold-300"
                  >
                    ₹2,000
                  </button>
                )}
              </div>
            </div>

            {/* Live Calculation Math Box */}
            <div className="p-3 rounded-xl bg-obsidian-950 border border-gold-500/15 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Pichhla Udhar (Old Due):</span>
                <span>{formatCurrency(currentDue)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Praapt Rashi (Minus Received):</span>
                <span>-{formatCurrency(numPayAmount)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gold-500/20 font-bold">
                <span className="text-slate-200">Naya Shesh Baaki (New Remaining Due):</span>
                <span className={`text-base font-extrabold font-mono ${remainingDueAfterPay > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {remainingDueAfterPay === 0 ? "All Cleared (₹0)" : formatCurrency(remainingDueAfterPay)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Bhugtan Ka Madhyam (Payment Mode)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "CASH" as const, label: "Cash", icon: Banknote },
                  { id: "UPI" as const, label: "UPI / QR", icon: QrCode },
                  { id: "CARD" as const, label: "Card", icon: CreditCard },
                  { id: "BANK_TRANSFER" as const, label: "Bank", icon: ArrowDownLeft },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = payMethod === m.id;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPayMethod(m.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-gold-500/20 border-gold-500 text-gold-300 shadow-gold"
                          : "bg-obsidian-900 text-slate-400 border-gold-500/10 hover:text-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mb-1" />
                      <span className="text-[10px]">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note / Remarks */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Note / Reference (Optional)</label>
              <input
                type="text"
                value={payNote}
                placeholder="e.g. Counter Cash, GPay, PhonePe"
                onChange={(e) => setPayNote(e.target.value)}
                className="w-full bg-obsidian-900 border border-gold-500/20 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-gold-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDueModal(false)}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                disabled={numPayAmount <= 0}
                className="flex-1 text-xs font-bold shadow-gold"
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                {numPayAmount > 0
                  ? `Minus Due & Save (${formatCurrency(numPayAmount)})`
                  : "Enter Paid Amount"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. Add Customer Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Quick Add Customer">
        <form onSubmit={handleCreateCustomer} className="space-y-3">
          <Input label="Full Name *" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input label="GSTIN (Optional)" value={gstin} onChange={(e) => setGstin(e.target.value)} />
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

      {/* Toast Notification */}
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg("")} />}
    </div>
  );
};
