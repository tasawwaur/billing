"use client";

import React, { useState, useEffect } from "react";
import { useSettingsStore, PERMANENT_PROFILE } from "@/store/settings-store";
import { useBillingStore } from "@/store/billing-store";
import { useProductStore } from "@/store/product-store";
import { useCustomerStore } from "@/store/customer-store";
import { useLedgerStore } from "@/store/ledger-store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { 
  Building, 
  Download, 
  Upload, 
  RotateCcw, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Info,
  Phone,
  Mail,
  MapPin,
  QrCode,
  FileCheck
} from "lucide-react";

export const SettingsView = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { bills, resetBills, importBackupBills } = useBillingStore();
  const { products, resetProducts, importBackupProducts } = useProductStore();
  const { customers, resetCustomers, importBackupCustomers } = useCustomerStore();
  const { ledger, payments, resetLedger, importBackupLedger, clearPayments } = useLedgerStore();
  const [toastMsg, setToastMsg] = useState("");

  const handleExportBackup = () => {
    const backupData = {
      settings,
      bills,
      products,
      customers,
      ledger,
      payments,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RajdhaniHomeDecor_Backup_${new Date().toISOString().split("T")[0]}.json`;
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
        let restoredCount = 0;
        if (Array.isArray(parsed.bills)) {
          importBackupBills(parsed.bills);
          restoredCount++;
        }
        if (Array.isArray(parsed.products)) {
          importBackupProducts(parsed.products);
          restoredCount++;
        }
        if (Array.isArray(parsed.customers)) {
          importBackupCustomers(parsed.customers);
          restoredCount++;
        }
        if (Array.isArray(parsed.ledger)) {
          importBackupLedger(parsed.ledger, Array.isArray(parsed.payments) ? parsed.payments : undefined);
          restoredCount++;
        }
        if (parsed.settings) {
          updateSettings(parsed.settings);
          restoredCount++;
        }
        setToastMsg(`Backup restored successfully (${restoredCount} modules imported)!`);
      } catch (err) {
        alert("Invalid backup file format! Please upload a valid JSON backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleResetAllData = () => {
    if (confirm("Reset / Restore all store data back to initial Rajdhani Home Decor state?")) {
      resetSettings();
      resetBills();
      resetProducts();
      resetCustomers();
      resetLedger();
      clearPayments();
      setToastMsg("All data restored to clean Rajdhani Home Decor state!");
    }
  };



  return (
    <div className="space-y-6">
      <PageHeader
        title="Store & Application Settings"
        subtitle="Business Identity, GSTIN, Backup Management & System Configuration"
        action={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Profile Verified & Permanently Locked</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Permanent Business Profile (7 Cols - No Edit / Read-Only) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-gold-500/20 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gold-500/15">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-gold-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Permanent Business Profile
              </h3>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gold-500/15 text-gold-300 border border-gold-500/30">
              <Lock className="w-3.5 h-3.5" />
              No Edit / Permanent Locked
            </span>
          </div>

          {/* Security Notice Banner */}
          <div className="p-3.5 rounded-xl bg-obsidian-900 border border-gold-500/20 flex items-start gap-2.5 text-xs text-slate-300">
            <Lock className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-gold-300">Permanent Store Identity (Protected):</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Store name, proprietor name, mobile number, GSTIN aur address permanently set kar diye gaye hain. Yeh kisi bhi roop mein change ya edit nahi honge taaki billing aur invoices 100% authentic rahein.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Store Name */}
            <div className="space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                <span>Store Name</span>
                <span className="text-[10px] text-gold-400 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.storeName}
                  readOnly
                  disabled
                  className="w-full bg-obsidian-950/80 border border-gold-500/20 text-gold-300 font-extrabold rounded-xl py-2.5 px-3.5 text-sm cursor-not-allowed select-none shadow-inner"
                />
              </div>
            </div>

            {/* Tagline & Owner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                  <span>Store Tagline</span>
                  <Lock className="w-3 h-3 text-gold-400" />
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  readOnly
                  disabled
                  className="w-full bg-obsidian-950/80 border border-gold-500/20 text-slate-300 font-semibold rounded-xl py-2 px-3 text-xs cursor-not-allowed select-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                  <span>Owner / Proprietor</span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </label>
                <input
                  type="text"
                  value={settings.ownerName || "Aalim"}
                  readOnly
                  disabled
                  className="w-full bg-obsidian-950/80 border border-gold-500/20 text-emerald-300 font-bold rounded-xl py-2 px-3 text-xs cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* GSTIN & UPI ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                  <span>GSTIN Registration</span>
                  <span className="text-[10px] text-blue-400 font-bold">9% GST Active</span>
                </label>
                <input
                  type="text"
                  value={settings.gstin}
                  readOnly
                  disabled
                  className="w-full bg-obsidian-950/80 border border-gold-500/20 text-blue-300 font-mono font-bold rounded-xl py-2 px-3 text-xs cursor-not-allowed select-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                  <span>UPI ID (for QR Code)</span>
                  <QrCode className="w-3 h-3 text-gold-400" />
                </label>
                <input
                  type="text"
                  value={settings.upiId}
                  readOnly
                  disabled
                  className="w-full bg-obsidian-950/80 border border-gold-500/20 text-gold-400 font-mono font-bold rounded-xl py-2 px-3 text-xs cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                  <span>Phone Number</span>
                  <Phone className="w-3 h-3 text-gold-400" />
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  readOnly
                  disabled
                  className="w-full bg-obsidian-950/80 border border-gold-500/20 text-slate-200 font-mono font-bold rounded-xl py-2 px-3 text-xs cursor-not-allowed select-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                  <span>Email Address</span>
                  <Mail className="w-3 h-3 text-gold-400" />
                </label>
                <input
                  type="text"
                  value={settings.email}
                  readOnly
                  disabled
                  className="w-full bg-obsidian-950/80 border border-gold-500/20 text-slate-200 font-medium rounded-xl py-2 px-3 text-xs cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
                <span>Store Address</span>
                <MapPin className="w-3 h-3 text-gold-400" />
              </label>
              <textarea
                rows={3}
                value={settings.address}
                readOnly
                disabled
                className="w-full bg-obsidian-950/80 border border-gold-500/20 text-slate-300 font-medium rounded-xl p-3 text-xs cursor-not-allowed select-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Backup & Data Maintenance (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Backup & Transfer */}
          <div className="glass-panel p-6 rounded-2xl border border-gold-500/20 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gold-500/15">
              <FileCheck className="w-5 h-5 text-gold-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Backup & Data Transfer
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Download complete store bills, inventory catalog, customer accounts, and ledger data as a secure JSON backup.
            </p>
            <div className="space-y-2.5">
              <Button
                variant="gold"
                type="button"
                onClick={handleExportBackup}
                className="w-full text-xs font-bold shadow-gold"
                icon={<Download className="w-4 h-4" />}
              >
                Export JSON Backup
              </Button>
              <label className="block w-full cursor-pointer group">
                <div className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-gradient-to-r from-gold-500/20 via-amber-500/20 to-gold-500/20 border border-gold-500/40 text-gold-300 hover:text-gold-200 hover:border-gold-400 text-center flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95">
                  <Upload className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" /> Restore JSON Backup
                </div>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
          </div>

          {/* Reset / Clean Restore */}
          <div className="glass-panel p-6 rounded-2xl border border-rose-500/20 space-y-3">
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" /> Reset / Clean Restore
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Restore initial clean Rajdhani Home Decor state (empty placeholder bills & payments, 9 home decor products). Store identity remains 100% permanent.
            </p>
            <Button
              variant="danger"
              type="button"
              onClick={handleResetAllData}
              className="w-full text-xs font-bold shadow-md hover:bg-rose-600 active:scale-95"
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Restore Clean Store Data
            </Button>
          </div>
        </div>
      </div>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg("")} />}
    </div>
  );
}

