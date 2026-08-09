import React from "react";
import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { formatCurrency, formatDate, formatTime } from "@/lib/currency";

interface BillTemplateProps {
  bill: Bill;
  settings: StoreSettings;
}

export const BillTemplateThermal80: React.FC<BillTemplateProps> = ({ bill, settings }) => {
  return (
    <div id="printable-bill-area" className="w-[300px] mx-auto bg-white text-slate-900 p-4 font-mono text-[11px] leading-tight border border-slate-300 shadow-md">
      {/* Center Header */}
      <div className="text-center pb-2 border-b border-dashed border-slate-900 mb-2">
        <h1 className="text-sm font-bold uppercase">{settings.storeName}</h1>
        <p className="text-[9px] text-slate-600">{settings.address}</p>
        <p className="text-[9px]">TEL: {settings.phone}</p>
        {settings.gstin && <p className="text-[9px]">GSTIN: {settings.gstin}</p>}
      </div>

      {/* Bill Meta */}
      <div className="border-b border-dashed border-slate-900 pb-2 mb-2">
        <div className="flex justify-between">
          <span>INV: {bill.invoiceNo}</span>
          <span>{formatDate(bill.date)}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>CUST: {bill.customerName.slice(0, 15)}</span>
          <span>{formatTime(bill.date)}</span>
        </div>
      </div>

      {/* Items */}
      <table className="w-full text-left mb-2 text-[10px]">
        <thead>
          <tr className="border-b border-slate-900 font-bold">
            <th className="py-1">ITEM</th>
            <th className="py-1 text-center">QTY</th>
            <th className="py-1 text-right">AMT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {bill.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 max-w-[140px] truncate">{item.productName}</td>
              <td className="py-1 text-center">{item.quantity}</td>
              <td className="py-1 text-right font-semibold">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t border-dashed border-slate-900 pt-2 mb-3 space-y-1">
        <div className="flex justify-between">
          <span>SUBTOTAL:</span>
          <span>{formatCurrency(bill.calculation.subtotal)}</span>
        </div>
        {settings.showGstOnBill && (
          <div className="flex justify-between text-[10px]">
            <span>TAX (GST):</span>
            <span>{formatCurrency(bill.calculation.totalTax)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-900">
          <span>TOTAL:</span>
          <span>{formatCurrency(bill.calculation.grandTotal)}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>PAY MODE:</span>
          <span>{bill.paymentMethod}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>PAID:</span>
          <span>{formatCurrency(bill.calculation.paidAmount)}</span>
        </div>
        {bill.calculation.dueAmount > 0 && (
          <div className="flex justify-between text-[10px] font-bold text-rose-700">
            <span>DUE:</span>
            <span>{formatCurrency(bill.calculation.dueAmount)}</span>
          </div>
        )}
      </div>

      {/* QR & Footer */}
      {settings.showQrOnBill && (
        <div className="text-center my-2 py-2 border-t border-b border-dashed border-slate-900">
          <div className="w-16 h-16 mx-auto bg-slate-900 text-white text-[8px] flex items-center justify-center p-1 rounded">
            UPI QR CODE
          </div>
          <p className="text-[9px] mt-1 font-bold">SCAN & PAY VIA UPI</p>
          <p className="text-[8px]">{settings.upiId}</p>
        </div>
      )}

      <div className="text-center pt-1 text-[9px]">
        <p className="font-bold">THANK YOU FOR YOUR VISIT!</p>
        <p className="text-[8px] text-slate-500">NO RETURN WITHOUT RECEIPT</p>
      </div>
    </div>
  );
};
