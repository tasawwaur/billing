import React from "react";
import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { formatCurrency, formatDate } from "@/lib/currency";

interface BillTemplateProps {
  bill: Bill;
  settings: StoreSettings;
}

export const BillTemplateClassic: React.FC<BillTemplateProps> = ({ bill, settings }) => {
  return (
    <div id="printable-bill-area" className="w-[800px] min-w-[800px] mx-auto bg-white text-slate-900 p-8 font-serif border-2 border-slate-900 shadow-lg">
      <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
        {settings.logoUrl && (
          <img
            src={settings.logoUrl}
            alt={settings.storeName}
            className="w-14 h-14 mx-auto mb-2 rounded-lg object-cover border border-slate-300"
          />
        )}
        <h1 className="text-3xl font-bold uppercase tracking-wide">{settings.storeName}</h1>
        <p className="text-xs font-sans text-slate-600 mt-1">{settings.address}</p>
        <p className="text-xs font-sans text-slate-600">Ph: {settings.phone} | GSTIN: {settings.gstin}</p>
        {settings.ownerName && (
          <p className="text-xs font-sans font-bold text-slate-800 mt-0.5">Proprietor: {settings.ownerName}</p>
        )}
      </div>

      <div className="flex justify-between text-xs font-sans mb-6">
        <div>
          <p className="font-bold">Customer: {bill.customerName}</p>
          <p>Phone: {bill.customerPhone}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">Invoice #: {bill.invoiceNo}</p>
          <p>Date: {formatDate(bill.date)}</p>
        </div>
      </div>

      <table className="w-full text-xs font-sans border border-slate-900 mb-6">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-900 font-bold">
            <th className="p-2 border-r border-slate-900">#</th>
            <th className="p-2 border-r border-slate-900 text-left">Item</th>
            <th className="p-2 border-r border-slate-900 text-center">Qty</th>
            <th className="p-2 border-r border-slate-900 text-right">Price</th>
            <th className="p-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-300">
              <td className="p-2 border-r border-slate-300 text-center">{idx + 1}</td>
              <td className="p-2 border-r border-slate-300">{item.productName}</td>
              <td className="p-2 border-r border-slate-300 text-center">{item.quantity}</td>
              <td className="p-2 border-r border-slate-300 text-right">{formatCurrency(item.price)}</td>
              <td className="p-2 text-right font-bold">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-end text-xs font-sans pt-2">
        <div className="w-1/2">
          <p className="font-bold">Payment Method: {bill.paymentMethod}</p>
          <p className="font-bold">Status: {bill.paymentStatus}</p>
        </div>
        <div className="w-1/2 text-right space-y-1">
          <p>Subtotal: {formatCurrency(bill.calculation.subtotal)}</p>
          <p>GST Total: {formatCurrency(bill.calculation.totalTax)}</p>
          <p className="text-base font-bold border-t border-slate-900 pt-1">
            Grand Total: {formatCurrency(bill.calculation.grandTotal)}
          </p>
          <p className="font-semibold text-slate-700">Paid: {formatCurrency(bill.calculation.paidAmount)}</p>
          {bill.calculation.dueAmount > 0 && (
            <p className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Shesh Baaki (Due): {formatCurrency(bill.calculation.dueAmount)}
            </p>
          )}
        </div>
      </div>

      <div className="pt-6 mt-4 border-t border-slate-300 flex justify-between items-end text-[10px] font-sans text-slate-600">
        <div>
          <p className="font-bold uppercase">Thank you for your business!</p>
        </div>
        <div className="text-right">
          <p className="font-bold">For {settings.storeName}</p>
          <div className="h-8"></div>
          <p className="border-t border-slate-400 pt-1 font-semibold">
            {settings.ownerName ? `${settings.ownerName} (Authorized Signatory)` : "Authorized Signatory"}
          </p>
        </div>
      </div>
    </div>
  );
};
