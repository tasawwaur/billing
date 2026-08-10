"use client";

import React, { useState } from "react";
import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { sendInvoiceWhatsApp, buildInvoiceMessage, getCleanIndianMobileDigits } from "@/lib/whatsapp";
import { downloadInvoiceAsImage } from "@/lib/image-export";
import { generateBillPDF } from "@/lib/pdf-export";
import { MessageCircle, Image as ImageIcon, Download, Share2, Printer, Check, Send } from "lucide-react";

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
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  // WhatsApp Custom Number Modal state
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [targetPhone, setTargetPhone] = useState(bill.customerPhone || "");

  const handleOpenWaModal = () => {
    setTargetPhone(bill.customerPhone || "");
    setIsWaModalOpen(true);
  };

  const handleSendWa = (e: React.FormEvent) => {
    e.preventDefault();
    sendInvoiceWhatsApp(bill, settings, targetPhone);
    setIsWaModalOpen(false);
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

  const handleShare = async () => {
    setIsSharing(true);
    const invoiceMessage = buildInvoiceMessage(bill, settings);

    // 1. Try sharing PDF File + Full Invoice Message via Web Share API
    try {
      const pdfResult = await generateBillPDF(bill, settings, elementId, false);
      if (typeof navigator !== "undefined" && navigator.canShare && pdfResult?.file) {
        if (navigator.canShare({ files: [pdfResult.file] })) {
          await navigator.share({
            title: `Tax Invoice ${bill.invoiceNo}`,
            text: invoiceMessage,
            files: [pdfResult.file],
          });
          setIsSharing(false);
          return;
        }
      }
    } catch (err) {
      console.warn("PDF file share fallback:", err);
    }

    // 2. Share Full Formatted Text Message via Web Share API
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Tax Invoice ${bill.invoiceNo}`,
          text: invoiceMessage,
        });
        setIsSharing(false);
        return;
      } catch (err) {
        console.log("Share dismissed");
      }
    }

    // 3. Fallback: Copy Full Invoice Text to Clipboard
    try {
      await navigator.clipboard.writeText(invoiceMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Clipboard error", err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 justify-end bg-obsidian-900/90 p-2.5 rounded-xl border border-gold-500/20">
        {/* 1. WhatsApp Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleOpenWaModal}
          icon={<MessageCircle className="w-4 h-4 text-emerald-400" />}
          className="hover:border-emerald-500/50"
        >
          WhatsApp
        </Button>

        {/* 2. Save Image (PNG) Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownloadImg}
          disabled={isImgDownloading}
          icon={<ImageIcon className="w-4 h-4 text-amber-400" />}
          className="hover:border-amber-500/50"
        >
          {isImgDownloading ? "Saving Image..." : "Save Image (PNG)"}
        </Button>

        {/* 3. Download PDF Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownloadPdf}
          disabled={isPdfDownloading}
          icon={<Download className="w-4 h-4 text-blue-400" />}
          className="hover:border-blue-500/50"
        >
          {isPdfDownloading ? "Generating PDF..." : "Download PDF"}
        </Button>

        {/* 4. Share Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleShare}
          disabled={isSharing}
          icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-purple-400" />}
        >
          {copied ? "Invoice Text Copied!" : isSharing ? "Preparing Share..." : "Share"}
        </Button>

        {/* 5. Print Button */}
        <Button
          variant="gold"
          size="sm"
          onClick={() => window.print()}
          icon={<Printer className="w-4 h-4" />}
        >
          Print
        </Button>
      </div>

      {/* WhatsApp Number Prompt Modal */}
      {isWaModalOpen && (
        <Modal
          isOpen={isWaModalOpen}
          onClose={() => setIsWaModalOpen(false)}
          title="Send Invoice via WhatsApp"
          maxWidth="md"
        >
          <form onSubmit={handleSendWa} className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl space-y-1">
              <p className="text-xs font-bold text-emerald-300">
                Invoice #{bill.invoiceNo} — ₹{bill.calculation.grandTotal.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-400">
                Type ANY 10-digit Indian WhatsApp mobile number below. No need to type +91 or 0!
              </p>
            </div>

            <Input
              label="WhatsApp Mobile Number (10 Digits) *"
              type="tel"
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
              placeholder="e.g. 9812345678"
              required
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsWaModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" size="sm" icon={<Send className="w-4 h-4" />}>
                Send on WhatsApp
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};
