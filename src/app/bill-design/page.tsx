"use client";

import React, { useState } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { useBillingStore } from "@/store/billing-store";
import { BillTemplateA4 } from "@/components/bills/BillTemplateA4";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Palette, Printer, Save, CheckCircle2, Sparkles } from "lucide-react";
import { Toast } from "@/components/ui/Toast";

export default function BillDesignStudioPage() {
  const { settings, updateSettings } = useSettingsStore();
  const { bills } = useBillingStore();

  const [activeTemplate, setActiveTemplate] = useState(settings.activeTemplate || "luxury");
  const [accentColor, setAccentColor] = useState(settings.accentColor || "#d4af37");
  const [showGst, setShowGst] = useState(settings.showGstOnBill);
  const [showQr, setShowQr] = useState(settings.showQrOnBill);
  const [showTerms, setShowTerms] = useState(settings.showTermsOnBill);
  const [toastMsg, setToastMsg] = useState("");

  const sampleBill = bills[0];

  const handleSaveDesign = () => {
    updateSettings({
      activeTemplate: activeTemplate as any,
      accentColor,
      showGstOnBill: showGst,
      showQrOnBill: showQr,
      showTermsOnBill: showTerms,
    });
    setToastMsg("Bill Template Design saved successfully!");
  };

  const handleTestPrint = () => {
    window.print();
  };

  const templates = [
    { id: "luxury", name: "Luxury Gold", desc: "Premium Gold border, serif headings & QR" },
    { id: "modern", name: "Modern White", desc: "Sleek corporate layout with clean lines" },
    { id: "classic", name: "Classic Formal", desc: "Traditional double-line GST invoice" },
    { id: "retail", name: "Retail Emerald", desc: "Vibrant header block & receipt layout" },
    { id: "thermal80", name: "80mm POS Receipt", desc: "Standard 3-inch POS thermal printer" },
    { id: "thermal58", name: "58mm Mini Receipt", desc: "Compact 2-inch mini thermal receipt" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="🧾 Bill Design Studio"
        subtitle="Live Template Customizer, Accent Colors & Thermal POS Receipts"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleTestPrint} icon={<Printer className="w-4 h-4" />}>
              Test Print
            </Button>
            <Button variant="gold" onClick={handleSaveDesign} icon={<Save className="w-4 h-4" />}>
              Save Design
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Customization Panel (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-gold-500/20 space-y-6">
          <div className="flex items-center gap-2 border-b border-gold-500/15 pb-3">
            <Palette className="w-5 h-5 text-gold-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Template Selection
            </h3>
          </div>

          {/* Template Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setActiveTemplate(tpl.id as any)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  activeTemplate === tpl.id
                    ? "bg-gold-500/20 border-gold-500 text-gold-300 shadow-gold"
                    : "bg-obsidian-900/80 border-gold-500/10 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold">{tpl.name}</span>
                    {activeTemplate === tpl.id && <CheckCircle2 className="w-4 h-4 text-gold-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{tpl.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Branding Options */}
          <div className="space-y-4 pt-4 border-t border-gold-500/15">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Visual Options & Toggles
            </h4>

            <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900/80 border border-gold-500/10">
              <span className="text-xs font-semibold text-slate-300">Primary Accent Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-gold-400 font-bold">{accentColor}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900/80 border border-gold-500/10 cursor-pointer">
                <span className="text-xs font-semibold text-slate-300">Show GST Tax Breakdown</span>
                <input
                  type="checkbox"
                  checked={showGst}
                  onChange={(e) => setShowGst(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900/80 border border-gold-500/10 cursor-pointer">
                <span className="text-xs font-semibold text-slate-300">Show UPI QR Code on Invoice</span>
                <input
                  type="checkbox"
                  checked={showQr}
                  onChange={(e) => setShowQr(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-obsidian-900/80 border border-gold-500/10 cursor-pointer">
                <span className="text-xs font-semibold text-slate-300">Show Terms & Conditions</span>
                <input
                  type="checkbox"
                  checked={showTerms}
                  onChange={(e) => setShowTerms(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right: Live Preview Canvas (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-gold-400" /> Real-time Live Bill Preview Canvas
            </span>
            <span className="text-[10px] font-mono text-gold-400">
              Active: {activeTemplate.toUpperCase()}
            </span>
          </div>

          <div className="p-4 bg-obsidian-950/80 rounded-2xl border border-gold-500/20 shadow-2xl max-h-[720px] overflow-y-auto">
            {sampleBill ? (
              <BillTemplateA4
                bill={sampleBill}
                settings={{
                  ...settings,
                  activeTemplate: activeTemplate as any,
                  accentColor,
                  showGstOnBill: showGst,
                  showQrOnBill: showQr,
                  showTermsOnBill: showTerms,
                }}
                templateOverride={activeTemplate}
              />
            ) : (
              <p className="text-center py-12 text-slate-400">No bill available for preview</p>
            )}
          </div>
        </div>
      </div>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg("")} />}
    </div>
  );
}
