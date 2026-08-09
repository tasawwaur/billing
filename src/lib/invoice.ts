import { BillCalculation } from "@/types/bill";

export interface InvoiceInputItem {
  price: number;
  quantity: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  taxRate?: number;
}

export function calculateInvoice(
  items: InvoiceInputItem[],
  orderDiscountPercent: number = 0,
  paidAmountInput?: number,
  isInterstate: boolean = false
): BillCalculation {
  let subtotal = 0;
  let itemDiscounts = 0;
  let totalTax = 0;

  items.forEach((item) => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    let itemDiscountAmount = 0;
    if (item.discount && item.discount > 0) {
      if (item.discountType === 'percentage') {
        itemDiscountAmount = (itemSubtotal * item.discount) / 100;
      } else {
        itemDiscountAmount = Math.min(itemSubtotal, item.discount);
      }
    }
    itemDiscounts += itemDiscountAmount;

    const afterItemDiscount = itemSubtotal - itemDiscountAmount;
    const taxRate = item.taxRate || 0;
    const itemTax = (afterItemDiscount * taxRate) / 100;
    totalTax += itemTax;
  });

  const taxableAfterItemDiscount = subtotal - itemDiscounts;
  const orderDiscountAmount = (taxableAfterItemDiscount * orderDiscountPercent) / 100;
  const taxableAmount = Math.max(0, taxableAfterItemDiscount - orderDiscountAmount);

  if (orderDiscountPercent > 0 && taxableAfterItemDiscount > 0) {
    const discountFactor = taxableAmount / taxableAfterItemDiscount;
    totalTax = totalTax * discountFactor;
  }

  const cgst = isInterstate ? 0 : Math.round((totalTax / 2) * 100) / 100;
  const sgst = isInterstate ? 0 : Math.round((totalTax / 2) * 100) / 100;
  const igst = isInterstate ? Math.round(totalTax * 100) / 100 : 0;
  const finalTotalTax = cgst + sgst + igst;

  const grandTotal = Math.round(taxableAmount + finalTotalTax);

  const paidAmount = paidAmountInput !== undefined ? Math.min(grandTotal, Math.max(0, paidAmountInput)) : grandTotal;
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    itemDiscounts: Math.round(itemDiscounts * 100) / 100,
    orderDiscount: Math.round(orderDiscountAmount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    cgst,
    sgst,
    igst,
    totalTax: finalTotalTax,
    grandTotal,
    paidAmount,
    dueAmount,
  };
}
