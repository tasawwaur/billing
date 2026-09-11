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

export type MeasurementUnit = 'SQM' | 'Meter' | 'Feet';

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
  measurementValue?: number;   // e.g. 0.77 (per piece)
  measurementUnit?: MeasurementUnit; // SQM | Meter | Feet
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
  isReturn?: boolean;
  parentInvoiceNo?: string;
  returnReason?: string;
  returnAdjustmentMode?: 'ADJUST_DUE' | 'CASH_REFUND' | 'STORE_CREDIT';
  originalGrandTotal?: number;
  returnDuesAdjusted?: number;      // Kitna due minus hua return se
  returnCustomerDueAtTime?: number; // Return ke waqt customer ka total due kitna tha
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
  // Transport / Vehicle Details (optional)
  transportVehicleNo?: string;
  transportLrNo?: string;
  transportName?: string;
  transportDestination?: string;
  transportFreightTerms?: string;
  // E-Invoice & E-Way Bill Details (optional)
  eInvoiceAckNo?: string;
  eWayBillNo?: string;
  eWayBillValidTill?: string;
  // Bank Account Details (optional)
  bankAccountName?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankIfscCode?: string;
}
