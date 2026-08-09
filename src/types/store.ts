import { BillTemplateId } from "./bill";

export interface StoreSettings {
  storeName: string;
  tagline: string;
  gstin: string;
  phone: string;
  email: string;
  address: string;
  currencySymbol: string;
  defaultTaxRate: number;
  upiId: string;
  logoUrl: string;
  activeTemplate: BillTemplateId;
  accentColor: string;
  showGstOnBill: boolean;
  showQrOnBill: boolean;
  showTermsOnBill: boolean;
  termsAndConditions: string;
}
