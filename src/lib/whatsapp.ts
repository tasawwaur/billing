import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { generateBillPDF } from "./pdf-export";

/**
 * Normalizes an Indian mobile number to standard +91 format.
 * Accepts formats: "8194030901", "08194030901", "918194030901", "+918194030901"
 * Returns "+918194030901"
 */
export function normalizeIndianMobile(input: string): string {
  if (!input) return "";
  const cleaned = input.replace(/[\s\-\(\)]/g, "");
  const digitsOnly = cleaned.replace(/\D/g, "");

  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    return `+91${digitsOnly.slice(1)}`;
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return `+${digitsOnly}`;
  } else if (cleaned.startsWith("+91") && digitsOnly.length === 12) {
    return cleaned;
  }

  return cleaned.startsWith("+") ? cleaned : `+91${digitsOnly}`;
}

export function validateIndianMobile(phone: string): boolean {
  const normalized = normalizeIndianMobile(phone);
  const numberPart = normalized.replace("+91", "");
  return /^[6789]\d{9}$/.test(numberPart);
}

export function buildInvoiceMessage(bill: Bill, settings: StoreSettings): string {
  const itemsText = bill.items
    .map((item) => `• ${item.productName} (x${item.quantity}) - ₹${item.total}`)
    .join("\n");

  const dueText = bill.calculation.dueAmount > 0 ? `\n⚠️ *Balance Due:* ₹${bill.calculation.dueAmount}` : "";

  return (
    `📄 *TAX INVOICE - ${settings.storeName}*\n\n` +
    `Invoice No: *${bill.invoiceNo}*\n` +
    `Date: ${new Date(bill.date).toLocaleDateString("en-IN")}\n` +
    `Customer: ${bill.customerName} (${normalizeIndianMobile(bill.customerPhone)})\n\n` +
    `*Summary of Items:*\n${itemsText}\n\n` +
    `*Grand Total:* ₹${bill.calculation.grandTotal}\n` +
    `*Amount Paid:* ₹${bill.calculation.paidAmount}${dueText}\n\n` +
    `Thank you for shopping with ${settings.storeName}!\n` +
    `Ph: ${settings.phone} | ${settings.address}`
  );
}

export function checkWhatsAppConfiguration(): { configured: boolean; mode: "DEMO" | "PRODUCTION_API" } {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN) {
    return { configured: true, mode: "PRODUCTION_API" };
  }
  return { configured: true, mode: "DEMO" };
}

/**
 * Sends Invoice via WhatsApp.
 * Direct PDF Document sharing on supported mobile devices via Web Share API.
 * Opens WhatsApp Web directly on Desktop Vercel deployments without popup blocker issues.
 */
export async function sendInvoiceWhatsApp(bill: Bill, settings: StoreSettings): Promise<void> {
  const normalizedPhone = normalizeIndianMobile(bill.customerPhone);
  const rawNumber = normalizedPhone.replace("+", "");
  const message = buildInvoiceMessage(bill, settings);
  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${rawNumber}?text=${encodedMsg}`;

  const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // On desktop, pre-open window synchronously to prevent Vercel HTTPS popup blockers
  let desktopWin: Window | null = null;
  if (!isMobile && typeof window !== "undefined") {
    desktopWin = window.open("about:blank", "_blank");
  }

  try {
    // Generate PDF file in memory
    const pdfResult = await generateBillPDF(bill, settings, "printable-bill-area", false);

    // If Web Share API is supported (e.g. Mobile Android/iOS), share PDF file directly
    if (typeof navigator !== "undefined" && navigator.canShare && pdfResult?.file) {
      if (navigator.canShare({ files: [pdfResult.file] })) {
        if (desktopWin && !desktopWin.closed) {
          desktopWin.close();
        }
        await navigator.share({
          title: `Tax Invoice PDF - ${bill.invoiceNo}`,
          text: message,
          files: [pdfResult.file],
        });
        return;
      }
    }
  } catch (err) {
    console.warn("PDF generation / share fallback:", err);
  }

  // Navigate to WhatsApp
  if (isMobile) {
    window.location.href = waUrl;
  } else if (desktopWin && !desktopWin.closed) {
    desktopWin.location.href = waUrl;
  } else if (typeof window !== "undefined") {
    window.open(waUrl, "_blank");
  }
}
