import React from "react";
import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { formatCurrency, formatDate } from "@/lib/currency";

interface BillTemplateProps {
  bill: Bill;
  settings: StoreSettings;
}

export const BillTemplateLuxuryGold: React.FC<BillTemplateProps> = ({ bill, settings }) => {
  return (
    <div id="printable-bill-area" className="w-full max-w-[800px] mx-auto bg-white text-slate-900 p-8 shadow-2xl font-sans rounded-xl border-2 border-[#d4af37]">
      <div className="flex justify-between items-start border-b-2 border-[#d4af37] pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b0f17] uppercase font-serif">
            {settings.storeName}
          </h1>
          <p className="text-xs text-[#926f1a] font-semibold uppercase tracking-widest mt-1">
            {settings.tagline}
          </p>
          <p className="text-xs text-slate-600 mt-2 max-w-sm">{settings.address}</p>
          <p className="text-xs text-slate-600">Ph: {settings.phone} | Email: {settings.email}</p>
          {settings.showGstOnBill && settings.gstin && (
            <p className="text-xs font-bold text-slate-800 mt-1">GSTIN: {settings.gstin}</p>
          )}
        </div>
        <div className="text-right">
          <span className="inline-block bg-[#0b0f17] text-[#d4af37] text-xs font-bold px-3 py-1 rounded uppercase tracking-wider mb-2">
            TAX INVOICE
          </span>
          <h2 className="text-xl font-bold text-slate-900">{bill.invoiceNo}</h2>
          <p className="text-xs text-slate-500 mt-1">Date: {formatDate(bill.date)}</p>
          <p className="text-xs font-semibold text-slate-700">Mode: {bill.paymentMethod}</p>
        </div>
      </div>

      <div className="bg-[#fcfaf2] border border-[#f5e7b8] rounded-lg p-4 mb-6 flex justify-between">
        <div>
          <p className="text-xs font-bold text-[#785816] uppercase tracking-wider">Billed To:</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">{bill.customerName}</p>
          <p className="text-xs text-slate-600">Phone: {bill.customerPhone}</p>
          {bill.customerGstin && <p className="text-xs text-slate-600">GSTIN: {bill.customerGstin}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-[#785816] uppercase tracking-wider">Status</p>
          <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded uppercase ${
            bill.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : bill.paymentStatus === 'CANCELLED' ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-800'
          }`}>
            {bill.paymentStatus}
          </span>
        </div>
      </div>

      <table className="w-full text-left text-xs mb-6 border-collapse">
        <thead>
          <tr className="bg-[#0b0f17] text-[#d4af37] font-semibold border-b border-slate-200">
            <th className="py-2.5 px-3">#</th>
            <th className="py-2.5 px-3">Item Description</th>
            <th className="py-2.5 px-3 text-right">Qty</th>
            <th className="py-2.5 px-3 text-right">Price</th>
            <th className="py-2.5 px-3 text-right">GST</th>
            <th className="py-2.5 px-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {bill.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
              <td className="py-2.5 px-3 font-medium">
                {item.productName}
                <span className="block text-[10px] text-slate-400">SKU: {item.sku}</span>
              </td>
              <td className="py-2.5 px-3 text-right font-semibold">{item.quantity} {item.unit}</td>
              <td className="py-2.5 px-3 text-right">{formatCurrency(item.price)}</td>
              <td className="py-2.5 px-3 text-right">{item.taxRate}%</td>
              <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-start pt-4 border-t border-slate-200 mb-6">
        <div className="w-1/2 pr-6">
          {settings.showQrOnBill && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-mono text-[9px] rounded text-center p-1 leading-tight">
                UPI QR<br/>CODE
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-800">Scan to Pay via UPI</p>
                <p className="text-[10px] font-mono text-slate-500">{settings.upiId}</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-1/2 pl-6 space-y-1.5 text-xs text-slate-700">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Subtotal</span>
            <span className="font-semibold">{formatCurrency(bill.calculation.subtotal)}</span>
          </div>
          {settings.showGstOnBill && (
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>GST Total</span>
              <span>{formatCurrency(bill.calculation.totalTax)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t-2 border-[#0b0f17] text-sm font-extrabold text-[#0b0f17]">
            <span>Grand Total</span>
            <span className="text-base text-[#926f1a]">{formatCurrency(bill.calculation.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
