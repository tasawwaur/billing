"use client";

import React, { useState } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { useBillingStore } from "@/store/billing-store";
import { useProductStore } from "@/store/product-store";
import { useCustomerStore } from "@/store/customer-store";
import { useLedgerStore } from "@/store/ledger-store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { Settings, Save, RotateCcw, Building, Download, Upload } from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { bills, resetBills, importBackupBills } = useBillingStore();
  const { products, resetProducts } = useProductStore();
  const { customers, resetCustomers } = useCustomerStore();
  const { ledger, resetLedger } = useLedgerStore();

  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [gstin, setGstin] = useState(settings.gstin);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [upiId, setUpiId] = useState(settings.upiId);
  const [terms, setTerms] = useState(settings.termsAndConditions);
  const [toastMsg, setToastMsg] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      tagline,
      gstin,
      phone,
      email,
      address,
      upiId,
      termsAndConditions: terms,
    });
    setToastMsg("Store configuration saved successfully!");
  };

  const handleExportBackup = () => {
    const backupData = {
      settings,
      bills,
      products,
      customers,
      ledger,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LuxuryStore_Backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMsg("JSON Backup exported successfully!");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.bills) importBackupBills(parsed.bills);
        if (parsed.settings) updateSettings(parsed.settings);
        setToastMsg("Backup restored successfully!");
      } catch (err) {
        alert("Invalid backup file format!");
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllData = () => {
    if (confirm("Reset all store data back to initial seed state?")) {
      resetSettings();
      resetBills();
      resetProducts();
      resetCustomers();
      resetLedger();
      setToastMsg("All demo data restored to initial state!");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="⚙️ Store & Application Settings"
        subtitle="Configure business details, GSTIN, UPI ID, terms & backup management"
        action={
          <Button variant="gold" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        }
      />

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Store Business Profile (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-gold-500/20 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gold-500/15">
            <Building className="w-5 h-5 text-gold-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Business Profile</h3>
          </div>

          <Input label="Store Name *" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
          <Input label="Store Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <Input label="GSTIN Registration" value={gstin} onChange={(e) => setGstin(e.target.value)} />
            <Input label="UPI ID (for QR Code)" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Store Address</label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-100 rounded-lg p-3 text-xs focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>

        {/* Backup & Policy Maintenance (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-gold-500/20 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider border-b border-gold-500/15 pb-3">
              Backup & Data Transfer
            </h3>
            <div className="space-y-2">
              <Button
                variant="gold"
                type="button"
                onClick={handleExportBackup}
                className="w-full text-xs font-bold"
                icon={<Download className="w-4 h-4" />}
              >
                Export JSON Backup
              </Button>
              <label className="block w-full cursor-pointer">
                <div className="w-full py-2.5 px-4 text-xs font-bold rounded-lg bg-obsidian-900 border border-gold-500/20 text-gold-400 hover:border-gold-500/40 text-center flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" /> Import JSON Backup
                </div>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-rose-500/20 space-y-3">
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider">Demo Data Reset</h3>
            <p className="text-xs text-slate-400">
              Restore initial seed state (300+ bills, 100+ customers, 50+ products).
            </p>
            <Button
              variant="danger"
              type="button"
              onClick={handleResetAllData}
              className="w-full text-xs font-bold"
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reset All Demo Data
            </Button>
          </div>
        </div>
      </form>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg("")} />}
    </div>
  );
}
