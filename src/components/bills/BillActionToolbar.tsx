"use client";

import React, { useState, useEffect } from "react";
import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { sendInvoiceWhatsApp, shareInvoiceJpgDirect } from "@/lib/whatsapp";
import { downloadInvoiceAsImage, copyInvoiceImageToClipboard } from "@/lib/image-export";
import { generateBillPDF } from "@/lib/pdf-export";
import { MessageCircle, Image as ImageIcon, Download, Printer, Check, Send, Copy, Share, Edit3 } from "lucide-react";

interface BillActionToolbarProps {
  bill: Bill;
  settings: StoreSettings;
  elementId?: string;
}

export const BillActionToolbar: React.FC<BillActionToolbarProps> = ({
  bill,
  settings,
  elementId = "printable-bill-area",
}) => {
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [isImgDownloading, setIsImgDownloading] = useState(false);
  const [isCopyingImg, setIsCopyingImg] = useState(false);
  const [isImgCopied, setIsImgCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSendingWa, setIsSendingWa] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // WhatsApp Custom Number Modal state - ALWAYS pre-fill with bill.customerPhone!
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [targetPhone, setTargetPhone] = useState(bill.customerPhone || "");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mobile =
        /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || "") ||
        (typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1 && window.innerWidth < 1024) ||
        window.innerWidth < 768;
      setIsMobile(mobile);
    }
  }, []);

  useEffect(() => {
    if (bill?.customerPhone) {
      setTargetPhone(bill.customerPhone);
    }
  }, [bill?.customerPhone]);

  const handleOpenWaModal = () => {
    setTargetPhone(bill.customerPhone || "");
    setIsWaModalOpen(true);
  };

  const handleSendWa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWaModalOpen(false);
    const phoneToUse = targetPhone || bill.customerPhone || "";
    setIsSendingWa(true);
    try {
      await sendInvoiceWhatsApp(bill, settings, phoneToUse, elementId);
    } finally {
      setIsSendingWa(false);
    }
  };

  // Direct 1-Click Send to Customer WhatsApp Number on Bill
  const handleDirectCustomerWa = async () => {
    if (!bill.customerPhone) {
      handleOpenWaModal();
      return;
    }
    setIsSendingWa(true);
    try {
      await sendInvoiceWhatsApp(bill, settings, bill.customerPhone, elementId);
    } finally {
      setIsSendingWa(false);
    }
  };

  const handleShareJpgDirect = async () => {
    setIsSharing(true);
    try {
      await shareInvoiceJpgDirect(bill, settings, elementId);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyImg = async () => {
    setIsCopyingImg(true);
    try {
      const ok = await copyInvoiceImageToClipboard(elementId);
      if (ok) {
        setIsImgCopied(true);
        setTimeout(() => setIsImgCopied(false), 3000);
      }
    } catch (err) {
      console.error("Copy image error:", err);
    } finally {
      setIsCopyingImg(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsPdfDownloading(true);
    try {
      await generateBillPDF(bill, settings, elementId, true);
    } catch (err) {
      console.error("PDF Download error:", err);
      window.print();
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const handleDownloadImg = async () => {
    setIsImgDownloading(true);
    try {
      await downloadInvoiceAsImage(bill.invoiceNo, bill.customerName, elementId);
    } catch (err) {
      console.error("Image export error:", err);
    } finally {
      setIsImgDownloading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5 justify-end bg-obsidian-900/90 p-2 rounded-xl border border-gold-500/20 text-xs">
        {/* 1. DIRECT WHATSAPP TO CUSTOMER (Uses customer's phone number on the bill) */}
        {bill.customerPhone ? (
          <div className="flex items-center gap-1">
            <Button
              variant="gold"
              size="sm"
              onClick={handleDirectCustomerWa}
              disabled={isSendingWa}
              icon={<MessageCircle className="w-4 h-4 fill-white" />}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md active:scale-95"
              title={`Directly open customer WhatsApp chat: ${bill.customerPhone}`}
            >
              {isSendingWa ? "Opening..." : `WhatsApp: ${bill.customerPhone}`}
            </Button>
            <button
              type="button"
              onClick={handleOpenWaModal}
              title="Change WhatsApp Number"
              className="p-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-400 hover:text-gold-300 border border-slate-700/60 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Button
            variant="gold"
            size="sm"
            onClick={handleOpenWaModal}
            disabled={isSendingWa}
            icon={<MessageCircle className="w-4 h-4" />}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold"
            title="Send bill on WhatsApp"
          >
            WhatsApp (Enter Number)
          </Button>
        )}

        {/* 2. Share Photo (Native File Share Sheet) */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleShareJpgDirect}
          disabled={isSharing}
          icon={<Share className="w-4 h-4 text-emerald-400" />}
          className="hover:border-emerald-500/50 text-slate-200"
          title="Share Bill JPG via other apps"
        >
          {isSharing ? "Sharing..." : "Share Photo"}
        </Button>

        {/* 3. Copy Image (PC Ctrl+V) */}
        {!isMobile && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyImg}
            disabled={isCopyingImg}
            icon={isImgCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            className="hover:border-cyan-500/50"
            title="Copy bill image to clipboard"
          >
            {isImgCopied ? "Copied!" : "Copy Image"}
          </Button>
        )}

        {/* 4. Save JPG (High Quality) Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownloadImg}
          disabled={isImgDownloading}
          icon={<ImageIcon className="w-4 h-4 text-amber-400" />}
          className="hover:border-amber-500/50"
          title="Download bill in High Quality JPG image format"
        >
          {isImgDownloading ? "Saving..." : "Save JPG"}
        </Button>

        {/* 5. Download PDF Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownloadPdf}
          disabled={isPdfDownloading}
          icon={<Download className="w-4 h-4 text-blue-400" />}
          className="hover:border-blue-500/50"
        >
          {isPdfDownloading ? "PDF..." : "PDF"}
        </Button>

        {/* 6. Print Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.print()}
          icon={<Printer className="w-4 h-4" />}
        >
          Print
        </Button>
      </div>

      {/* WhatsApp Number Prompt Modal - Automatic Customer Phone Pre-fill */}
      {isWaModalOpen && (
        <Modal
          isOpen={isWaModalOpen}
          onClose={() => setIsWaModalOpen(false)}
          title="Send Invoice on WhatsApp (JPG Image)"
          maxWidth="md"
        >
          <form onSubmit={handleSendWa} className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-300">
                  Invoice #{bill.invoiceNo} — ₹{bill.calculation.grandTotal.toLocaleString("en-IN")}
                </span>
                {bill.customerName && (
                  <span className="text-[11px] font-bold text-slate-200 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-md">
                    👤 {bill.customerName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                📸 Bill ki <strong className="text-emerald-300">Ultra-HD JPG Photo</strong> phone me download ho jayegi aur customer ka WhatsApp chat khul jayega. Chat me 📎 (Gallery) se photo bhej dein! (Koi text message nahi jayega).
              </p>
            </div>

            <div>
              <Input
                label="Customer WhatsApp Mobile Number (10 Digits) *"
                type="tel"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                placeholder="e.g. 9812345678"
                required
                autoFocus
              />
              {bill.customerPhone && targetPhone !== bill.customerPhone && (
                <button
                  type="button"
                  onClick={() => setTargetPhone(bill.customerPhone)}
                  className="mt-1.5 text-[11px] text-gold-400 hover:text-gold-300 underline block"
                >
                  Bill customer number set karein: {bill.customerPhone}
                </button>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsWaModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="sm"
                icon={<Send className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Send JPG on WhatsApp
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};
