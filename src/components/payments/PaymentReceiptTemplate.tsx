import React from "react";
import { PaymentRecord } from "@/types/payment";
import { StoreSettings } from "@/types/store";
import { formatCurrency, formatDate, formatTime } from "@/lib/currency";

interface PaymentReceiptTemplateProps {
  payment: PaymentRecord;
  settings: StoreSettings;
  dueBefore?: number;
}

export const PaymentReceiptTemplate: React.FC<PaymentReceiptTemplateProps> = ({
  payment,
  settings,
  dueBefore = 0,
}) => {
  const remainingDue = Math.max(0, dueBefore - payment.amount);

  return (
    <div
      id="printable-bill-area"
      className="w-full max-w-[600px] mx-auto bg-white text-slate-900 p-8 shadow-2xl font-sans rounded-xl border-2 border-[#d4af37]"
    >
      {/* Header */}
      <div className="text-center border-b-2 border-[#d4af37] pb-4 mb-6">
        <h1 className="text-2xl font-extrabold tracking-wider text-[#0b0f17] uppercase font-serif">
          {settings.storeName}
        </h1>
        <p className="text-xs text-[#926f1a] font-semibold uppercase tracking-widest mt-0.5">
          {settings.tagline}
        </p>
        <p className="text-xs text-slate-600 mt-1">{settings.address}</p>
        <p className="text-xs text-slate-600">Ph: {settings.phone}</p>
      </div>

      {/* Receipt Title */}
      <div className="flex justify-between items-center bg-[#fcfaf2] border border-[#f5e7b8] p-3 rounded-lg mb-6">
        <div>
          <span className="text-xs font-bold text-[#785816] uppercase tracking-wider block">OFFICIAL RECEIPT</span>
          <span className="text-sm font-mono font-bold text-slate-900">{payment.referenceNo || payment.id}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">Date & Time</span>
          <span className="text-xs font-bold text-slate-800">
            {formatDate(payment.date)} • {formatTime(payment.date)}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="space-y-2 text-xs text-slate-700 mb-6 pb-4 border-b border-slate-200">
        <div className="flex justify-between">
          <span className="text-slate-500">Received From:</span>
          <span className="font-bold text-slate-900">{payment.customerName}</span>
        </div>
        {payment.customerPhone && (
          <div className="flex justify-between">
            <span className="text-slate-500">Customer Phone:</span>
            <span className="font-mono text-slate-800">{payment.customerPhone}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">Invoice Reference:</span>
          <span className="font-mono font-bold text-[#926f1a]">{payment.invoiceNo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Payment Method:</span>
          <span className="font-bold text-slate-900">{payment.method}</span>
        </div>
      </div>

      {/* Financial Table */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs mb-6">
        {dueBefore > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Previous Due Balance</span>
            <span>{formatCurrency(dueBefore)}</span>
          </div>
        )}
        <div className="flex justify-between py-2 border-y border-slate-200 text-sm font-extrabold text-[#0b0f17]">
          <span>Amount Received</span>
          <span className="text-emerald-700 text-base">{formatCurrency(payment.amount)}</span>
        </div>
        {dueBefore > 0 && (
          <div className="flex justify-between font-bold text-rose-700 pt-1">
            <span>Remaining Dues</span>
            <span>{formatCurrency(remainingDue)}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-slate-200 text-[10px] text-slate-500">
        <p className="font-semibold text-slate-700">Thank you for your payment!</p>
        <p>Computer generated payment receipt • No signature required</p>
      </div>
    </div>
  );
};
