import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";

/**
 * Cleanly extracts 12-digit Indian mobile number with country code 91.
 * Accepts: "8194030901", "08194030901", "918194030901", "+91 8194030901"
 * Output: "918194030901" (User only needs to enter 10 digits, 0 or +91 is not needed!)
 */
export function getCleanIndianMobileDigits(input: string): string {
  if (!input) return "";
  const rawDigits = input.replace(/\D/g, "");

  if (rawDigits.length === 10) {
    return `91${rawDigits}`;
  }
  if (rawDigits.length === 11 && rawDigits.startsWith("0")) {
    return `91${rawDigits.slice(1)}`;
  }
  if (rawDigits.length === 12 && rawDigits.startsWith("91")) {
    return rawDigits;
  }
  if (rawDigits.length > 10) {
    return `91${rawDigits.slice(-10)}`;
  }

  return rawDigits ? `91${rawDigits}` : "";
}

export function normalizeIndianMobile(input: string): string {
  const digits = getCleanIndianMobileDigits(input);
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  return input;
}

export function validateIndianMobile(phone: string): boolean {
  const digits = getCleanIndianMobileDigits(phone);
  return digits.length === 12 && /^91[6789]\d{9}$/.test(digits);
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
 * Direct WhatsApp chat launch for 10-digit Indian numbers without requiring +91 or 0 manual typing.
 */
export function sendInvoiceWhatsApp(bill: Bill, settings: StoreSettings): void {
  if (typeof window === "undefined") return;

  const phoneDigits = getCleanIndianMobileDigits(bill.customerPhone);
  const message = buildInvoiceMessage(bill, settings);
  const encodedMsg = encodeURIComponent(message);

  const waUrl = phoneDigits
    ? `https://wa.me/${phoneDigits}?text=${encodedMsg}`
    : `https://wa.me/?text=${encodedMsg}`;

  // Direct open with popup blocker fallback
  const win = window.open(waUrl, "_blank");
  if (!win || win.closed || typeof win.closed === "undefined") {
    window.location.href = waUrl;
  }
}
