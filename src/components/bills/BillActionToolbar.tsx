"use client";

import React, { useState } from "react";
import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { Button } from "@/components/ui/Button";
import { sendInvoiceWhatsApp } from "@/lib/whatsapp";
import { downloadInvoiceAsImage } from "@/lib/image-export";
import { generateBillPDF } from "@/lib/pdf-export";
import { MessageCircle, Image as ImageIcon, Download, Share2, Printer, Check } from "lucide-react";

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
  const [copied, setCopied] = useState(false);

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
    const text = `Tax Invoice ${bill.invoiceNo} from ${settings.storeName} for ₹${bill.calculation.grandTotal}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${bill.invoiceNo}`,
          text,
          url: window.location.href,
        });
        return;
      } catch (err) {
        console.log("Share dismissed");
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard error", err);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 justify-end bg-obsidian-900/90 p-2.5 rounded-xl border border-gold-500/20">
      {/* 1. WhatsApp Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => sendInvoiceWhatsApp(bill, settings)}
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
        icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-purple-400" />}
      >
        {copied ? "Link Copied!" : "Share"}
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
  );
};
