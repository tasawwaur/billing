export type LedgerEntryType = 'CREDIT' | 'DEBIT';

export interface LedgerEntry {
  id: string;
  partyId: string;
  partyName: string;
  partyType: 'CUSTOMER' | 'SUPPLIER';
  type: LedgerEntryType;
  amount: number;
  runningBalance: number;
  referenceNo: string;
  description: string;
  date: string;
}
