import React from "react";
import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { formatCurrency, formatDate } from "@/lib/currency";

interface BillTemplateProps {
  bill: Bill;
  settings: StoreSettings;
}

export const BillTemplateRetail: React.FC<BillTemplateProps> = ({ bill, settings }) => {
  return (
    <div id="printable-bill-area" className="w-full max-w-[800px] mx-auto bg-slate-50 text-slate-900 p-8 font-sans shadow-lg rounded-xl">
      <div className="bg-emerald-700 text-white p-6 rounded-lg mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold uppercase">{settings.storeName}</h1>
          <p className="text-xs text-emerald-100">{settings.tagline}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold bg-emerald-800 px-2.5 py-1 rounded">RETAIL INVOICE</span>
          <p className="text-sm font-mono font-bold mt-1">{bill.invoiceNo}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-white p-4 rounded-lg border border-slate-200">
        <div>
          <p className="text-slate-400 font-bold uppercase text-[10px]">Store Info</p>
          <p className="font-semibold text-slate-800">{settings.address}</p>
          <p className="text-slate-500">Ph: {settings.phone}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 font-bold uppercase text-[10px]">Billed To</p>
          <p className="font-semibold text-slate-800">{bill.customerName}</p>
          <p className="text-slate-500">{bill.customerPhone}</p>
          <p className="text-slate-400 font-bold uppercase text-[10px] mt-2">Date</p>
          <p className="font-semibold text-slate-800">{formatDate(bill.date)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Item</th>
              <th className="py-2.5 px-4 text-right">Qty</th>
              <th className="py-2.5 px-4 text-right">Rate</th>
              <th className="py-2.5 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bill.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-2.5 px-4 font-medium text-slate-900">{item.productName}</td>
                <td className="py-2.5 px-4 text-right font-bold">{item.quantity}</td>
                <td className="py-2.5 px-4 text-right">{formatCurrency(item.price)}</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 text-xs">
        <div>
          <span className="text-slate-400 font-bold uppercase text-[10px]">Payment Method</span>
          <p className="font-bold text-emerald-700">{bill.paymentMethod} ({bill.paymentStatus})</p>
        </div>
        <div className="text-right">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Total Amount</span>
          <p className="text-xl font-extrabold text-slate-900">{formatCurrency(bill.calculation.grandTotal)}</p>
        </div>
      </div>
    </div>
  );
};
