import React from "react";
import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { formatCurrency, formatDate } from "@/lib/currency";

interface BillTemplateProps {
  bill: Bill;
  settings: StoreSettings;
}

export const BillTemplateThermal58: React.FC<BillTemplateProps> = ({ bill, settings }) => {
  return (
    <div id="printable-bill-area" className="w-[220px] mx-auto bg-white text-slate-900 p-2 font-mono text-[9px] leading-none border border-slate-300 shadow-sm">
      <div className="text-center pb-1 border-b border-black mb-1">
        <h1 className="text-[11px] font-bold uppercase">{settings.storeName}</h1>
        <p className="text-[8px]">{settings.phone}</p>
      </div>

      <div className="border-b border-black pb-1 mb-1 text-[8px]">
        <p>INV: {bill.invoiceNo}</p>
        <p>DATE: {formatDate(bill.date)}</p>
        <p>CUST: {bill.customerName.slice(0, 12)}</p>
      </div>

      <div className="space-y-1 mb-1 border-b border-black pb-1">
        {bill.items.map((item, idx) => (
          <div key={idx} className="flex justify-between">
            <span className="max-w-[120px] truncate">{item.quantity}x {item.productName}</span>
            <span className="font-bold">{formatCurrency(item.total)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-0.5 font-bold">
        <div className="flex justify-between text-[10px]">
          <span>TOTAL:</span>
          <span>{formatCurrency(bill.calculation.grandTotal)}</span>
        </div>
        <div className="flex justify-between text-[8px] font-normal">
          <span>PAID ({bill.paymentMethod}):</span>
          <span>{formatCurrency(bill.calculation.paidAmount)}</span>
        </div>
      </div>

      <div className="text-center pt-2 text-[8px]">
        <p>THANK YOU!</p>
      </div>
    </div>
  );
};
