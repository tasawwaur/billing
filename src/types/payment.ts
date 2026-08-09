export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface PaymentRecord {
  id: string;
  billId: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  method: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
  referenceNo?: string;
  date: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
}
