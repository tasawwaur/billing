import React from "react";
import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { formatCurrency, formatDate } from "@/lib/currency";

interface BillTemplateProps {
  bill: Bill;
  settings: StoreSettings;
}

export const BillTemplateLuxuryGold: React.FC<BillTemplateProps> = ({ bill, settings }) => {
  const totalQuantity = bill.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div id="printable-bill-area" className="w-[800px] min-w-[800px] mx-auto bg-white text-slate-900 p-6 shadow-2xl font-sans rounded-xl border-2 border-[#d4af37]">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-[#d4af37] pb-3 mb-3">
        <div className="flex items-start gap-3.5">
          {settings.logoUrl && (
            <img
              src={settings.logoUrl}
              alt={settings.storeName}
              className="w-14 h-14 rounded-lg object-cover border border-[#d4af37]/40 shadow-sm shrink-0 mt-0.5"
            />
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0b0f17] uppercase font-serif leading-none">
              {settings.storeName}
            </h1>
            <p className="text-[10px] text-[#926f1a] font-bold uppercase tracking-wider mt-1">
              {settings.tagline}
            </p>
            <p className="text-[11px] text-slate-600 mt-1 max-w-sm leading-snug">{settings.address}</p>
            <p className="text-[11px] text-slate-600">Ph: <span className="font-semibold text-slate-800">{settings.phone}</span> | Email: {settings.email}</p>
            <div className="flex items-center gap-3 mt-0.5 text-[11px]">
              {settings.showGstOnBill && settings.gstin && (
                <p className="font-bold text-slate-800">GSTIN: <span className="font-mono">{settings.gstin}</span></p>
              )}
              {settings.ownerName && (
                <p className="text-slate-700">Proprietor: <span className="font-bold text-slate-900">{settings.ownerName}</span></p>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider mb-1 ${
            bill.isReturn ? "bg-rose-900 text-rose-200" : "bg-[#0b0f17] text-[#d4af37]"
          }`}>
            {bill.isReturn ? "SALES RETURN CREDIT NOTE" : "TAX INVOICE"}
          </span>
          <h2 className="text-lg font-bold text-slate-900 font-mono">{bill.invoiceNo}</h2>
          {bill.parentInvoiceNo && (
            <p className="text-[11px] font-bold text-rose-700 font-mono">Original Ref: {bill.parentInvoiceNo}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-0.5">Date: {formatDate(bill.date)}</p>
          <p className="text-[11px] font-semibold text-slate-700">Mode: {bill.isReturn ? `Return (${bill.returnAdjustmentMode || "ADJUST_DUE"})` : bill.paymentMethod}</p>
        </div>
      </div>

      {/* Customer Information Bar */}
      <div className="bg-[#fcfaf2] border border-[#f5e7b8] rounded-lg p-2.5 px-3.5 mb-3 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold text-[#785816] uppercase tracking-wider">Billed To:</span>
          <span className="text-sm font-bold text-slate-900 ml-2">{bill.customerName}</span>
          <span className="text-xs text-slate-600 ml-3">Phone: {bill.customerPhone}</span>
          {bill.customerGstin && <span className="text-xs text-slate-600 ml-3">GSTIN: {bill.customerGstin}</span>}
        </div>
        <div className="text-right">
          <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded uppercase ${
            bill.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : bill.paymentStatus === 'CANCELLED' ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-800'
          }`}>
            {bill.paymentStatus}
          </span>
        </div>
      </div>

      {/* Items Table - Clean & Compact */}
      <table className="w-full text-left text-xs mb-3 border-collapse">
        <thead>
          <tr className="bg-[#0b0f17] text-[#d4af37] font-semibold border-b border-slate-200">
            <th className="py-2 px-2.5 w-8">#</th>
            <th className="py-2 px-2.5">Item Description</th>
            <th className="py-2 px-2.5 text-right w-20">Qty</th>
            <th className="py-2 px-2.5 text-right w-24">Price</th>
            <th className="py-2 px-2.5 text-right w-20">GST</th>
            <th className="py-2 px-2.5 text-right w-28">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {bill.items.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50">
              <td className="py-1.5 px-2.5 text-slate-400 font-mono">{idx + 1}</td>
              <td className="py-1.5 px-2.5 font-medium">
                <span className="font-bold text-slate-900">{item.productName}</span>
                {item.sku && <span className="text-[10px] text-slate-400 ml-2">SKU: {item.sku}</span>}
              </td>
              <td className="py-1.5 px-2.5 text-right font-semibold">{item.quantity} {item.unit}</td>
              <td className="py-1.5 px-2.5 text-right font-mono">{formatCurrency(item.price)}</td>
              <td className="py-1.5 px-2.5 text-right font-mono">{item.taxRate}%</td>
              <td className="py-1.5 px-2.5 text-right font-bold text-slate-900 font-mono">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bottom Section: Order Summary & Calculation - NO WASTED SPACE */}
      <div className="flex justify-between items-start pt-2.5 border-t border-slate-200 mb-2 gap-4">
        {/* Left: Invoice Summary Card */}
        <div className="w-1/2 space-y-1.5 text-xs">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1 text-slate-700">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-bold text-slate-900">{bill.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Total Items:</span>
              <span className="font-semibold text-slate-900">{bill.items.length} item(s)</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Total Quantity:</span>
              <span className="font-semibold text-slate-900">{totalQuantity} units</span>
            </div>
            <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-500 italic">
              Thank you for shopping with Rajdhani Home Decor!
            </div>
          </div>
        </div>

        {/* Right: Calculations (Subtotal, GST, Grand Total, Paid, Balance Due) */}
        <div className="w-1/2 space-y-1 text-xs text-slate-700">
          <div className="flex justify-between py-0.5 border-b border-slate-100">
            <span className="text-slate-500">Subtotal:</span>
            <span className="font-semibold font-mono">{formatCurrency(bill.calculation.subtotal)}</span>
          </div>
          {bill.calculation.orderDiscount > 0 && (
            <div className="flex justify-between py-0.5 border-b border-slate-100 text-emerald-700 font-semibold">
              <span>Order Discount:</span>
              <span className="font-mono">-{formatCurrency(bill.calculation.orderDiscount)}</span>
            </div>
          )}
          {settings.showGstOnBill && (
            <div className="flex justify-between py-0.5 border-b border-slate-100">
              <span className="text-slate-500">
                GST Tax {bill.calculation.totalTax > 0 ? `(CGST ${formatCurrency(bill.calculation.cgst)} + SGST ${formatCurrency(bill.calculation.sgst)})` : "(0%)"}:
              </span>
              <span className={`font-mono ${bill.calculation.totalTax > 0 ? "font-bold text-slate-900" : "text-slate-400"}`}>
                {formatCurrency(bill.calculation.totalTax)}
              </span>
            </div>
          )}
          <div className="flex justify-between py-1 border-t-2 border-[#0b0f17] text-sm font-extrabold text-[#0b0f17]">
            <span>Grand Total:</span>
            <span className="text-base text-[#926f1a] font-mono">{formatCurrency(bill.calculation.grandTotal)}</span>
          </div>
          <div className="flex justify-between py-0.5 text-slate-700 font-semibold border-t border-slate-100">
            <span>Paid Amount:</span>
            <span className="font-bold text-emerald-700 font-mono">{formatCurrency(bill.calculation.paidAmount)}</span>
          </div>
          {bill.calculation.dueAmount > 0 && (
            <div className="flex justify-between py-1 px-2 rounded bg-rose-50 border border-rose-200 text-rose-800 font-bold mt-1">
              <span>Balance Due (Shesh Baaki):</span>
              <span className="text-sm font-extrabold text-rose-900 font-mono">{formatCurrency(bill.calculation.dueAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Terms & Conditions and Authorized Signatory */}
      {settings.showTermsOnBill && settings.termsAndConditions && (
        <div className="pt-2 border-t border-slate-200 mt-2 flex justify-between items-end text-[10px] text-slate-500">
          <div className="max-w-md">
            <p className="font-bold text-slate-700 uppercase tracking-wider mb-0.5">Terms & Conditions:</p>
            <p className="whitespace-pre-line leading-relaxed">{settings.termsAndConditions}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-800 text-[11px]">For {settings.storeName}</p>
            <div className="h-6"></div>
            <p className="border-t border-slate-300 pt-0.5 font-semibold text-slate-700">
              {settings.ownerName ? `${settings.ownerName} (Authorized Signatory)` : "Authorized Signatory"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
