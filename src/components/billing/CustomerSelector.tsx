"use client";

import React, { useState } from "react";
import { Customer } from "@/types/customer";
import { User, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/currency";

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomerId: string;
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: (c: Omit<Customer, "id" | "totalBills" | "totalSpent" | "dueBalance" | "createdAt">) => Customer;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onAddCustomer,
}) => {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

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

      <div className="flex items-center justify-between bg-obsidian-900/90 p-2.5 rounded-lg border border-gold-500/15">
        <div>
          <p className="text-xs font-bold text-slate-100">{selectedCustomer?.name}</p>
          <p className="text-[10px] text-slate-400">{selectedCustomer?.phone}</p>
        </div>
        {selectedCustomer?.dueBalance && selectedCustomer.dueBalance > 0 ? (
          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            Due: {formatCurrency(selectedCustomer.dueBalance)}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Clear Balance
          </span>
        )}
      </div>

      {/* Customer Quick Switcher */}
      <div className="mt-2 relative">
        <select
          value={selectedCustomerId}
          onChange={(e) => {
            const found = customers.find((c) => c.id === e.target.value);
            if (found) onSelectCustomer(found);
          }}
          className="w-full bg-obsidian-950 text-slate-200 border border-gold-500/15 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gold-500"
        >
          {filtered.slice(0, 40).map((c) => (
            <option key={c.id} value={c.id} className="bg-obsidian-900 text-slate-200">
              {c.name} ({c.phone}) {c.dueBalance > 0 ? `- Due ${formatCurrency(c.dueBalance)}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Add Customer Modal */}
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
    </div>
  );
};
