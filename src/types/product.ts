export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  barcode: string;
  price: number;
  costPrice: number;
  stock: number;
  minStockAlert: number;
  unit: string;
  taxRate: number;
  hsnCode?: string;
  image?: string;
  createdAt: string;
}
