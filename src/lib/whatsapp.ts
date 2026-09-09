import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { copyInvoiceImageToClipboard, downloadInvoiceAsImage, getInvoiceImageFile } from "./image-export";

/**
 * Cleanly extracts 12-digit Indian mobile number with country code 91.
 * Accepts: "8194030901", "08194030901", "918194030901", "+91 8194030901"
 * Output: "918194030901"
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
    .map((item, idx) => `${idx + 1}. *${item.productName}* x ${item.quantity} ${item.unit} = ₹${item.total}`)
    .join("\n");

  const dueText =
    bill.calculation.dueAmount > 0
      ? `\n⚠️ *Shesh Baaki (Balance Due):* ₹${bill.calculation.dueAmount}`
      : `\n✅ *Status:* Full Payment Received (Poora Bhugtan Ho Gaya)`;

  return (
    `*🏛️ ${settings.storeName}*\n` +
    `*TAX INVOICE / BILL*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📋 *Invoice No:* ${bill.invoiceNo}\n` +
    `📅 *Date:* ${new Date(bill.date).toLocaleDateString("en-IN")}\n` +
    `👤 *Customer:* ${bill.customerName}\n` +
    (bill.customerPhone ? `📞 *Mobile:* ${bill.customerPhone}\n` : "") +
    `━━━━━━━━━━━━━━━━━━\n` +
    `*ITEMS DETAILS:*\n${itemsText}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💰 *Subtotal:* ₹${bill.calculation.subtotal}\n` +
    (bill.calculation.totalTax > 0 ? `📊 *GST Tax:* ₹${bill.calculation.totalTax}\n` : `📊 *GST:* 0% (Bina GST)\n`) +
    `💵 *Grand Total:* ₹${bill.calculation.grandTotal}\n` +
    `🟢 *Paid Amount:* ₹${bill.calculation.paidAmount}` +
    `${dueText}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `✨ *Thank you for shopping with ${settings.storeName}!* ✨\n` +
    `👤 Proprietor: ${settings.ownerName || "Aalim"}\n` +
    `📱 Call/WhatsApp: ${settings.phone}\n` +
    `📍 ${settings.address}`
  );
}

/**
 * Direct, instant WhatsApp launch for the SPECIFIC customer number on the bill.
 * Automatically opens the customer's chat directly (on Android/iOS native app or PC Web).
 * Does NOT append text, leaving the message box empty for the JPG bill photo.
 */
export function openWhatsAppDirect(
  bill: Bill,
  settings: StoreSettings,
  targetPhone?: string,
  includeText: boolean = false
): void {
  if (typeof window === "undefined") return;

  const phoneToUse = targetPhone || bill.customerPhone || "";
  const phoneDigits = getCleanIndianMobileDigits(phoneToUse);

  const isMobile =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || "");

  let waUrl = "";
  if (includeText) {
    const message = buildInvoiceMessage(bill, settings);
    const encodedMsg = encodeURIComponent(message);
    waUrl = phoneDigits
      ? (isMobile ? `https://wa.me/${phoneDigits}?text=${encodedMsg}` : `https://web.whatsapp.com/send?phone=${phoneDigits}&text=${encodedMsg}`)
      : `https://wa.me/?text=${encodedMsg}`;
  } else {
    // Open directly to the customer's chat without text
    waUrl = phoneDigits
      ? (isMobile ? `https://wa.me/${phoneDigits}` : `https://web.whatsapp.com/send?phone=${phoneDigits}`)
      : (isMobile ? `https://wa.me/` : `https://web.whatsapp.com/`);
  }

  const win = window.open(waUrl, "_blank");
  if (!win || win.closed || typeof win.closed === "undefined") {
    window.location.href = waUrl;
  }
}

/**
 * Native direct JPG sharing (opens system share sheet with JPG file attached)
 */
export async function shareInvoiceJpgDirect(
  bill: Bill,
  settings: StoreSettings,
  elementId: string = "printable-bill-area"
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const jpgFile = await getInvoiceImageFile(bill.invoiceNo, bill.customerName, elementId);
    if (
      jpgFile &&
      typeof navigator !== "undefined" &&
      navigator.canShare &&
      navigator.canShare({ files: [jpgFile] })
    ) {
      await navigator.share({
        title: `Bill ${bill.invoiceNo}`,
        files: [jpgFile],
      });
      return true;
    }
  } catch (err) {
    console.warn("Direct JPG share error:", err);
  }

  // Fallback
  await copyInvoiceImageToClipboard(elementId);
  await downloadInvoiceAsImage(bill.invoiceNo, bill.customerName, elementId);
  openWhatsAppDirect(bill, settings, bill.customerPhone, false);
  return false;
}

/**
 * Sends Invoice directly to the CUSTOMER'S WhatsApp mobile number on the bill:
 * 1. Automatically downloads the Ultra-HD JPG bill image to the phone/PC.
 * 2. Copies the image to clipboard (for Gboard chip on mobile & Ctrl+V on PC).
 * 3. Immediately opens WhatsApp DIRECTLY inside that customer's chat!
 */
export async function sendInvoiceWhatsApp(
  bill: Bill,
  settings: StoreSettings,
  customPhone?: string,
  elementId: string = "printable-bill-area"
): Promise<{ copied: boolean; shared: boolean }> {
  if (typeof window === "undefined") return { copied: false, shared: false };

  const phoneToUse = customPhone || bill.customerPhone || "";

  // 1. Copy HD Bill Image to Clipboard
  let copied = false;
  try {
    copied = await copyInvoiceImageToClipboard(elementId);
  } catch (err) {
    console.warn("Clipboard copy error:", err);
  }

  // 2. Automatically download HD JPG bill file so it appears in recent photos/downloads
  try {
    await downloadInvoiceAsImage(bill.invoiceNo, bill.customerName, elementId);
  } catch (err) {
    console.warn("Auto download JPG error:", err);
  }

  // 3. Immediately open WhatsApp directly into THAT customer's chat!
  openWhatsAppDirect(bill, settings, phoneToUse, false);

  return { copied, shared: true };
}
