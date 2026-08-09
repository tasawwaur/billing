import React from "react";
import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { formatCurrency, formatDate } from "@/lib/currency";

interface BillTemplateProps {
  bill: Bill;
  settings: StoreSettings;
}

export const BillTemplateLuxuryBlack: React.FC<BillTemplateProps> = ({ bill, settings }) => {
  return (
    <div id="printable-bill-area" className="w-full max-w-[800px] mx-auto bg-[#0b0f17] text-slate-100 p-8 shadow-2xl font-sans rounded-xl border border-gold-500/30">
      <div className="flex justify-between items-start border-b border-gold-500/40 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gold-400 uppercase font-serif">
            {settings.storeName}
          </h1>
          <p className="text-xs text-gold-300 font-semibold uppercase tracking-widest mt-1">
            {settings.tagline}
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-sm">{settings.address}</p>
          <p className="text-xs text-slate-400">Ph: {settings.phone}</p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-gold-500 text-obsidian-950 text-xs font-extrabold px-3 py-1 rounded uppercase tracking-wider mb-2">
            LUXURY INVOICE
          </span>
          <h2 className="text-xl font-mono font-bold text-slate-100">{bill.invoiceNo}</h2>
          <p className="text-xs text-slate-400 mt-1">Date: {formatDate(bill.date)}</p>
        </div>
      </div>

      <table className="w-full text-left text-xs mb-6 border-collapse">
        <thead>
          <tr className="bg-obsidian-900 text-gold-400 border-b border-gold-500/20">
            <th className="py-2.5 px-3">Item Description</th>
            <th className="py-2.5 px-3 text-right">Qty</th>
            <th className="py-2.5 px-3 text-right">Rate</th>
            <th className="py-2.5 px-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gold-500/10 text-slate-200">
          {bill.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-2.5 px-3 font-medium">{item.productName}</td>
              <td className="py-2.5 px-3 text-right">{item.quantity}</td>
              <td className="py-2.5 px-3 text-right">{formatCurrency(item.price)}</td>
              <td className="py-2.5 px-3 text-right font-bold text-gold-300">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-end border-t border-gold-500/20 pt-4 text-xs">
        <div>
          <p className="text-slate-400">Customer: <strong className="text-slate-100">{bill.customerName}</strong></p>
          <p className="text-slate-400">Payment: <strong className="text-gold-400">{bill.paymentMethod} ({bill.paymentStatus})</strong></p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-slate-400">Subtotal: {formatCurrency(bill.calculation.subtotal)}</p>
          <p className="text-slate-400">GST Tax: {formatCurrency(bill.calculation.totalTax)}</p>
          <p className="text-lg font-extrabold text-gold-300 pt-1 border-t border-gold-500/30">
            Grand Total: {formatCurrency(bill.calculation.grandTotal)}
          </p>
        </div>
      </div>
    </div>
  );
};
