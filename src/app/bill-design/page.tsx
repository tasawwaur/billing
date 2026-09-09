"use client";

import React, { useState, useEffect } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { useBillingStore } from "@/store/billing-store";
import { BillTemplateA4 } from "@/components/bills/BillTemplateA4";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Palette, Printer, Save, CheckCircle2, Sparkles, ZoomIn, ZoomOut, Maximize2, Smartphone, Monitor } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { Bill, BillTemplateId } from "@/types/bill";

const MOCK_SAMPLE_BILL: Bill = {
  id: "sample-preview-inv",
  invoiceNo: "INV-2026-0001",
  customerId: "cust-0",
  customerName: "Mohd Tasawwar",
  customerPhone: "6200282035",
  customerGstin: "",
  date: new Date().toISOString(),
  items: [
    {
      productId: "prod-3",
      productName: "FLUTED PANELS",
      sku: "RHD-FLP-003",
      price: 750,
      quantity: 2,
      unit: "pcs",
      discount: 0,
      discountType: "percentage",
      taxRate: 9,
      taxAmount: 135,
      total: 1635,
    },
    {
      productId: "prod-1",
      productName: "PVC PANELS",
      sku: "RHD-PVC-001",
      price: 450,
      quantity: 4,
      unit: "pcs",
      discount: 0,
      discountType: "percentage",
      taxRate: 9,
      taxAmount: 162,
      total: 1962,
    },
    {
      productId: "prod-5",
      productName: "U.V. MARBLE SEAT",
      sku: "RHD-UVM-005",
      price: 1500,
      quantity: 1,
      unit: "sheet",
      discount: 0,
      discountType: "percentage",
      taxRate: 9,
      taxAmount: 135,
      total: 1635,
    },
  ],
  calculation: {
    subtotal: 4800,
    orderDiscountAmount: 0,
    taxableAmount: 4800,
    cgst: 216,
    sgst: 216,
    igst: 0,
    totalTax: 432,
    roundOff: 0,
    grandTotal: 5232,
    paidAmount: 5232,
    dueAmount: 0,
    changeAmount: 0,
  },
  paymentMethod: "UPI",
  paymentStatus: "PAID",
  templateId: "retail_premium",
  createdAt: new Date().toISOString(),
};

export default function BillDesignStudioPage() {
  const { settings, updateSettings } = useSettingsStore();
  const { bills } = useBillingStore();

  const [mounted, setMounted] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<BillTemplateId>("retail_premium");
  const [accentColor, setAccentColor] = useState("#d4af37");
  const [showGst, setShowGst] = useState(true);
  const [showQr, setShowQr] = useState(true);
  const [showTerms, setShowTerms] = useState(true);
  const [zoomScale, setZoomScale] = useState<number>(0.72);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    setMounted(true);
    if (settings.activeTemplate) {
      setActiveTemplate(settings.activeTemplate);
    }
    if (settings.accentColor) {
      setAccentColor(settings.accentColor);
    }
    setShowGst(settings.showGstOnBill ?? true);
    setShowQr(settings.showQrOnBill ?? true);
    setShowTerms(settings.showTermsOnBill ?? true);
  }, [settings]);

  const sampleBill = (bills && bills.length > 0) ? bills[0] : MOCK_SAMPLE_BILL;
  const isThermal = activeTemplate === "thermal80" || activeTemplate === "thermal58";

  const handleSaveDesign = () => {
    updateSettings({
      activeTemplate: activeTemplate as BillTemplateId,
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

  const templates: { id: BillTemplateId; name: string; desc: string; badge?: string }[] = [
    { id: "retail_premium", name: "Retail Emerald", desc: "Vibrant emerald header block & receipt layout", badge: "Popular" },
    { id: "luxury_gold", name: "Luxury Gold", desc: "Premium Gold border, royal serif headings & QR", badge: "Default" },
    { id: "modern_white", name: "Modern White", desc: "Sleek corporate layout with clean lines" },
    { id: "classic_retail", name: "Classic Formal", desc: "Traditional double-line GST invoice" },
    { id: "luxury_black", name: "Obsidian Black", desc: "Dark luxury theme with gold highlights" },
    { id: "thermal80", name: "80mm POS Receipt", desc: "Standard 3-inch POS thermal receipt" },
    { id: "thermal58", name: "58mm Mini Receipt", desc: "Compact 2-inch mini thermal receipt" },
  ];

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[450px] text-slate-400 text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
          <span>Bill Studio Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Customization Panel (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-4 sm:p-5 rounded-2xl border border-gold-500/20 space-y-5">
          <div className="flex items-center justify-between border-b border-gold-500/15 pb-2.5">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gold-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Select Template Design
              </h3>
            </div>
            <span className="text-[10px] text-gold-400 font-mono font-bold">
              {templates.length} Templates
            </span>
          </div>

          {/* Template Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {templates.map((tpl) => {
              const isSelected = activeTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setActiveTemplate(tpl.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "bg-gold-500/20 border-gold-400 text-gold-200 shadow-gold ring-1 ring-gold-400/40"
                      : "bg-obsidian-900/80 border-gold-500/10 text-slate-400 hover:text-slate-200 hover:border-gold-500/30"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center gap-1">
                      <span className="text-xs font-bold truncate text-slate-100">{tpl.name}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                      ) : tpl.badge ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gold-500/10 text-gold-400 border border-gold-500/20">
                          {tpl.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-snug">{tpl.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Branding & Visual Options */}
          <div className="space-y-3 pt-3 border-t border-gold-500/15">
            <h4 className="text-[11px] font-extrabold text-gold-400 uppercase tracking-wider">
              Visual Options & Toggles
            </h4>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-900/80 border border-gold-500/10">
              <span className="text-xs font-semibold text-slate-300">Accent Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-gold-400 font-bold">{accentColor}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-900/80 border border-gold-500/10 cursor-pointer hover:bg-obsidian-900 transition-colors">
                <span className="font-semibold text-slate-300">Show GST Tax Breakdown</span>
                <input
                  type="checkbox"
                  checked={showGst}
                  onChange={(e) => setShowGst(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-900/80 border border-gold-500/10 cursor-pointer hover:bg-obsidian-900 transition-colors">
                <span className="font-semibold text-slate-300">Show UPI QR Code on Invoice</span>
                <input
                  type="checkbox"
                  checked={showQr}
                  onChange={(e) => setShowQr(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-obsidian-900/80 border border-gold-500/10 cursor-pointer hover:bg-obsidian-900 transition-colors">
                <span className="font-semibold text-slate-300">Show Terms & Conditions</span>
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

        {/* Right: Live Preview Canvas with Zoom and Full-Width Fit Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-obsidian-900/90 border border-gold-500/20">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-xs font-extrabold text-slate-200">
                Live Preview
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gold-500/20 text-gold-300 border border-gold-500/30">
                {templates.find((t) => t.id === activeTemplate)?.name || activeTemplate}
              </span>
            </div>

            {/* Quick Zoom Fit Selector Buttons */}
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setZoomScale(0.68)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  zoomScale <= 0.70
                    ? "bg-gold-500 text-obsidian-950 border-gold-400 shadow-sm"
                    : "bg-obsidian-950 text-slate-300 border-gold-500/20 hover:text-gold-300"
                }`}
                title="Fit full invoice width inside view"
              >
                📱 Fit Screen
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(0.85)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  zoomScale > 0.70 && zoomScale < 0.95
                    ? "bg-gold-500 text-obsidian-950 border-gold-400 shadow-sm"
                    : "bg-obsidian-950 text-slate-300 border-gold-500/20 hover:text-gold-300"
                }`}
                title="85% Medium view"
              >
                85%
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(1.0)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  zoomScale >= 0.95
                    ? "bg-gold-500 text-obsidian-950 border-gold-400 shadow-sm"
                    : "bg-obsidian-950 text-slate-300 border-gold-500/20 hover:text-gold-300"
                }`}
                title="100% Full A4 print view"
              >
                100%
              </button>
            </div>
          </div>

          {/* Canvas Viewport: Scaled and completely centered so no column is ever cut off */}
          <div className="p-3 sm:p-4 bg-obsidian-950 rounded-2xl border border-gold-500/20 shadow-2xl max-h-[750px] overflow-auto flex justify-center">
            <div
              style={{
                zoom: isThermal ? 1 : zoomScale,
                width: isThermal ? (activeTemplate === "thermal58" ? "220px" : "300px") : "800px",
                maxWidth: isThermal ? (activeTemplate === "thermal58" ? "220px" : "300px") : "800px",
                margin: "0 auto",
                transformOrigin: "top center",
              }}
              className="transition-all"
            >
              <BillTemplateA4
                bill={sampleBill}
                settings={{
                  ...settings,
                  activeTemplate,
                  accentColor,
                  showGstOnBill: showGst,
                  showQrOnBill: showQr,
                  showTermsOnBill: showTerms,
                }}
                templateOverride={activeTemplate}
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-2">
            <span>✨ Real-time Preview: Jo template yahan select karenge, wahi bill download & print par aayega.</span>
          </div>
        </div>
      </div>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg("")} />}
    </div>
  );
}

