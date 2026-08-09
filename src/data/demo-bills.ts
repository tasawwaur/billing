import { Bill, BillTemplateId, PaymentMethod, BillStatus } from "@/types/bill";
import { calculateInvoice } from "@/lib/invoice";
import { INITIAL_PRODUCTS } from "./demo-products";

const customerSeeds = [
  { id: "cust-1", name: "Rahul Sharma", phone: "+919876543210", gstin: "27AABCU9603R1ZM" },
  { id: "cust-2", name: "Amitav Roy", phone: "+919831012345", gstin: "19AAACR1234F1Z2" },
  { id: "cust-3", name: "Sana Khan", phone: "+919811198765", gstin: "07AAACK5678G1Z9" },
  { id: "cust-4", name: "Priya Sengupta", phone: "+919748055443" },
  { id: "cust-5", name: "Vikram Malhotra", phone: "+919820011223", gstin: "27AAACM9988H1Z1" },
  { id: "cust-6", name: "Ananya Birla", phone: "+919821044332" },
  { id: "cust-7", name: "Kabir Mehta", phone: "+919819955441" },
  { id: "cust-8", name: "Meera Kapoor", phone: "+919830022114" },
  { id: "cust-9", name: "Rohan Singhania", phone: "+919822233445" },
  { id: "cust-10", name: "Tanya Chawla", phone: "+919811099887" },
];

const templatesList: BillTemplateId[] = [
  "luxury_gold",
  "luxury_black",
  "modern_white",
  "classic_retail",
  "premium_gst",
  "corporate_a4",
  "retail_premium",
  "thermal80",
  "thermal58",
];

const paymentModes: PaymentMethod[] = ["UPI", "CASH", "CARD", "CREDIT", "BANK_TRANSFER"];

function generate300Bills(): Bill[] {
  const bills: Bill[] = [];
  const totalCount = 310;
  const startDate = new Date(2026, 1, 1).getTime();
  const endDate = new Date(2026, 7, 9).getTime();

  for (let i = 1; i <= totalCount; i++) {
    const invNum = `INV-2026-${String(i).padStart(5, "0")}`;
    const cust = customerSeeds[i % customerSeeds.length];
    
    // Spread timestamp
    const timeProgress = i / totalCount;
    const itemTime = new Date(startDate + timeProgress * (endDate - startDate));
    const isoDate = itemTime.toISOString();

    const prodCount = 1 + (i % 3);
    const billItems = [];
    const invoiceInputs = [];

    for (let p = 0; p < prodCount; p++) {
      const prod = INITIAL_PRODUCTS[(i + p * 7) % INITIAL_PRODUCTS.length];
      const qty = 1 + ((i + p) % 2);
      const discount = (i % 7 === 0) ? 5 : 0;
      
      const itemSubtotal = prod.price * qty;
      const discAmt = (itemSubtotal * discount) / 100;
      const afterDisc = itemSubtotal - discAmt;
      const taxAmount = (afterDisc * prod.taxRate) / 100;

      billItems.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        price: prod.price,
        quantity: qty,
        unit: prod.unit,
        discount,
        discountType: "percentage" as const,
        taxRate: prod.taxRate,
        taxAmount,
        total: afterDisc + taxAmount,
      });

      invoiceInputs.push({
        price: prod.price,
        quantity: qty,
        discount,
        discountType: "percentage" as const,
        taxRate: prod.taxRate,
      });
    }

    const orderDiscountPercent = (i % 11 === 0) ? 5 : 0;
    const mode = paymentModes[i % paymentModes.length];
    const isDue = (mode === "CREDIT" || i % 13 === 0);
    const isPartial = (!isDue && i % 17 === 0);
    const isCancelled = (i === 15 || i === 42 || i === 88);

    const calc = calculateInvoice(
      invoiceInputs,
      orderDiscountPercent,
      isDue ? 0 : isPartial ? 1500 : undefined
    );

    let status: BillStatus = "PAID";
    if (isCancelled) {
      status = "CANCELLED";
    } else if (isDue) {
      status = "DUE";
    } else if (isPartial) {
      status = "PARTIAL";
    }

    bills.unshift({
      id: `bill-${i}`,
      invoiceNo: invNum,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerGstin: cust.gstin,
      date: isoDate,
      items: billItems,
      calculation: calc,
      paymentMethod: mode,
      paymentStatus: status,
      templateId: templatesList[i % templatesList.length],
      createdAt: isoDate,
    });
  }

  return bills;
}

export const INITIAL_BILLS: Bill[] = generate300Bills();
