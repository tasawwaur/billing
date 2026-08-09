export type BillStatus = 'PAID' | 'DUE' | 'PARTIAL' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'CREDIT' | 'BANK_TRANSFER';
export type BillTemplateId =
  | 'luxury_gold'
  | 'luxury_black'
  | 'modern_white'
  | 'classic_retail'
  | 'premium_gst'
  | 'corporate_a4'
  | 'retail_premium'
  | 'thermal80'
  | 'thermal58';

export interface BillItem {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  unit: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface BillCalculation {
  subtotal: number;
  itemDiscounts: number;
  orderDiscount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
}

export interface Bill {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  date: string;
  items: BillItem[];
  calculation: BillCalculation;
  paymentMethod: PaymentMethod;
  paymentStatus: BillStatus;
  templateId: BillTemplateId;
  notes?: string;
  createdAt: string;
}
