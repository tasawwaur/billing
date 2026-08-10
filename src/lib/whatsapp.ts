import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";

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
 * Sends Invoice via WhatsApp instantly.
 * Direct WhatsApp chat launch pre-filled with customer phone number and formatted tax invoice summary.
 * Uses official web.whatsapp.com on Desktop and api.whatsapp.com on Mobile.
 * Includes automatic popup blocker fallback.
 */
export function sendInvoiceWhatsApp(bill: Bill, settings: StoreSettings): void {
  if (typeof window === "undefined") return;

  const normalizedPhone = normalizeIndianMobile(bill.customerPhone);
  const digitsOnly = normalizedPhone.replace(/\D/g, ""); // e.g. "919876543210"
  const message = buildInvoiceMessage(bill, settings);
  const encodedMsg = encodeURIComponent(message);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  let waUrl = "";
  if (digitsOnly && digitsOnly.length >= 10) {
    waUrl = isMobile
      ? `https://api.whatsapp.com/send?phone=${digitsOnly}&text=${encodedMsg}`
      : `https://web.whatsapp.com/send?phone=${digitsOnly}&text=${encodedMsg}`;
  } else {
    waUrl = isMobile
      ? `https://api.whatsapp.com/send?text=${encodedMsg}`
      : `https://web.whatsapp.com/send?text=${encodedMsg}`;
  }

  // 1. Try opening new tab
  const win = window.open(waUrl, "_blank");

  // 2. Popup blocker fallback
  if (!win || win.closed || typeof win.closed === "undefined") {
    window.location.href = waUrl;
  }
}
