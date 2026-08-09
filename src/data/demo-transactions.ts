import { LedgerEntry } from "@/types/ledger";
import { PaymentRecord } from "@/types/payment";

export const INITIAL_LEDGER: LedgerEntry[] = [
  { id: "led-1", partyId: "cust-2", partyName: "Amitav Roy", partyType: "CUSTOMER", type: "DEBIT", amount: 1280, runningBalance: 1280, referenceNo: "INV-2026-00309", description: "Bill INV-2026-00309 pending due", date: "2026-08-09T20:45:00" },
  { id: "led-2", partyId: "cust-4", partyName: "Priya Sengupta", partyType: "CUSTOMER", type: "DEBIT", amount: 3800, runningBalance: 3800, referenceNo: "INV-2026-00305", description: "Bill INV-2026-00305 due balance", date: "2026-08-09T18:30:00" },
  { id: "led-3", partyId: "cust-5", partyName: "Vikram Malhotra", partyType: "CUSTOMER", type: "DEBIT", amount: 8500, runningBalance: 8500, referenceNo: "INV-2026-00300", description: "Bill INV-2026-00300 credit purchase", date: "2026-08-09T14:20:00" },
  { id: "led-4", partyId: "cust-6", partyName: "Ananya Birla", partyType: "CUSTOMER", type: "DEBIT", amount: 4870, runningBalance: 4870, referenceNo: "INV-2026-00295", description: "Bill INV-2026-00295 pending balance", date: "2026-08-09T11:05:00" },
  
  // Suppliers / Payables
  { id: "led-5", partyId: "supp-1", partyName: "Geneva Watch Suppliers Corp", partyType: "SUPPLIER", type: "CREDIT", amount: 4500, runningBalance: 4500, referenceNo: "PO-8841", description: "Stock shipment invoice pending", date: "2026-08-08T16:00:00" },
  { id: "led-6", partyId: "supp-2", partyName: "Jaipur Gemstone & Gold Craft", partyType: "SUPPLIER", type: "CREDIT", amount: 3300, runningBalance: 3300, referenceNo: "PO-8842", description: "Silver & Kundan stock supply", date: "2026-08-07T12:00:00" }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  { id: "pay-1", billId: "bill-310", invoiceNo: "INV-2026-00310", customerId: "cust-1", customerName: "Rahul Sharma", customerPhone: "+919876543210", amount: 4512, method: "UPI", referenceNo: "REC-378146", date: "2026-08-09T22:39:00", status: "COMPLETED", createdAt: "2026-08-09T22:39:00" },
  { id: "pay-2", billId: "bill-309", invoiceNo: "INV-2026-00309", customerId: "cust-10", customerName: "Tanya Chawla", customerPhone: "+919811099887", amount: 1133, method: "BANK_TRANSFER", referenceNo: "NEFT-884102", date: "2026-08-08T19:15:00", status: "COMPLETED", createdAt: "2026-08-08T19:15:00" },
  { id: "pay-3", billId: "bill-307", invoiceNo: "INV-2026-00307", customerId: "cust-8", customerName: "Meera Kapoor", customerPhone: "+919830022114", amount: 6320, method: "CARD", referenceNo: "AUTH-99120", date: "2026-08-07T14:40:00", status: "COMPLETED", createdAt: "2026-08-07T14:40:00" },
  { id: "pay-4", billId: "bill-306", invoiceNo: "INV-2026-00306", customerId: "cust-7", customerName: "Kabir Mehta", customerPhone: "+919819955441", amount: 3000, method: "CASH", referenceNo: "POS-CASH-306", date: "2026-08-06T11:20:00", status: "COMPLETED", createdAt: "2026-08-06T11:20:00" },
  { id: "pay-5", billId: "bill-304", invoiceNo: "INV-2026-00304", customerId: "cust-5", customerName: "Vikram Malhotra", customerPhone: "+919820011223", amount: 15000, method: "UPI", referenceNo: "UPI/9912384/PAY", date: "2026-08-05T18:10:00", status: "COMPLETED", createdAt: "2026-08-05T18:10:00" },
];
