import React from "react";
import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { formatCurrency, formatDate } from "@/lib/currency";

interface BillTemplateProps {
  bill: Bill;
  settings: StoreSettings;
}

export const BillTemplateModern: React.FC<BillTemplateProps> = ({ bill, settings }) => {
  return (
    <div id="printable-bill-area" className="w-full max-w-[800px] mx-auto bg-white text-slate-900 p-8 font-sans shadow-xl rounded-lg">
      <div className="flex justify-between items-start pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{settings.storeName}</h1>
          <p className="text-xs text-slate-500">{settings.address}</p>
          <p className="text-xs text-slate-500">Ph: {settings.phone} | GSTIN: {settings.gstin}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">INVOICE</span>
          <p className="text-lg font-mono font-bold text-slate-900">{bill.invoiceNo}</p>
          <p className="text-xs text-slate-500">{formatDate(bill.date)}</p>
        </div>
      </div>

      <div className="py-4 my-4 bg-slate-50 rounded-lg px-4 flex justify-between text-xs">
        <div>
          <span className="text-slate-400 block font-semibold uppercase text-[10px]">Customer Details</span>
          <p className="font-bold text-slate-900">{bill.customerName}</p>
          <p className="text-slate-500">{bill.customerPhone}</p>
        </div>
        <div className="text-right">
          <span className="text-slate-400 block font-semibold uppercase text-[10px]">Status</span>
          <span className="font-bold uppercase text-slate-900">{bill.paymentStatus} ({bill.paymentMethod})</span>
        </div>
      </div>

      <table className="w-full text-xs text-left mb-6">
        <thead>
          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
            <th className="py-2">Item</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Rate</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {bill.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-2 font-medium">{item.productName}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">{formatCurrency(item.price)}</td>
              <td className="py-2 text-right font-semibold">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end text-xs pt-4 border-t border-slate-200">
        <div className="w-1/2 space-y-1.5 text-right">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal:</span>
            <span className="font-semibold">{formatCurrency(bill.calculation.subtotal)}</span>
          </div>
          {settings.showGstOnBill && (
            <div className="flex justify-between">
              <span className="text-slate-500">Tax (GST 18%):</span>
              <span>{formatCurrency(bill.calculation.totalTax)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-900">
            <span>Total:</span>
            <span>{formatCurrency(bill.calculation.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
