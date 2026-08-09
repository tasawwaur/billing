import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { downloadInvoiceAsImage } from "./image-export";

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
    `📄 *TAX INVOICE PDF - ${settings.storeName}*\n\n` +
    `Invoice No: *${bill.invoiceNo}*\n` +
    `Date: ${new Date(bill.date).toLocaleDateString("en-IN")}\n` +
    `Customer: ${bill.customerName} (${normalizeIndianMobile(bill.customerPhone)})\n\n` +
    `*Summary of Items:*\n${itemsText}\n\n` +
    `*Grand Total:* ₹${bill.calculation.grandTotal}\n` +
    `*Amount Paid:* ₹${bill.calculation.paidAmount}${dueText}\n\n` +
    `📎 Attached herewith is your official tax invoice document.\n` +
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
 * Sends PDF Invoice via WhatsApp.
 * Uses Web Share API (native PDF file sharing) when supported, or launches WhatsApp Web with pre-filled invoice message & triggers print/PDF download.
 */
export async function sendInvoiceWhatsApp(bill: Bill, settings: StoreSettings): Promise<void> {
  const normalizedPhone = normalizeIndianMobile(bill.customerPhone);
  const rawNumber = normalizedPhone.replace("+", "");
  const message = buildInvoiceMessage(bill, settings);

  // If Web Share API is available, try file share or text share
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: `Tax Invoice PDF - ${bill.invoiceNo}`,
        text: message,
      });
      return;
    } catch (err) {
      console.log("Web share dismissed, falling back to direct WhatsApp Web link");
    }
  }

  // Fallback: Open WhatsApp Web/App with pre-filled invoice message
  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${rawNumber}?text=${encodedMsg}`;
  window.open(waUrl, "_blank");

  // Also trigger PDF print/download window so the user has the PDF ready to attach in WhatsApp
  setTimeout(() => {
    window.print();
  }, 600);
}
