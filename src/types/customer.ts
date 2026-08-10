export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  totalBills: number;
  totalSpent: number;
  dueBalance: number; // Lena Hai
  denaBalance?: number; // Dena Hai
  createdAt: string;
}
