import React from "react";
import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { formatCurrency, formatDate, formatTime } from "@/lib/currency";

interface BillTemplateProps {
  bill: Bill;
  settings: StoreSettings;
}

export const BillTemplateThermal80: React.FC<BillTemplateProps> = ({ bill, settings }) => {
  // Check if any item has measurement data
  const hasMeasurement = bill.items.some(
    (item) => item.measurementValue && item.measurementValue > 0
  );

  // Return bill ke liye DUE balance adjustment calculate karo
  const isReturn = bill.isReturn === true;
  const returnAmount = bill.calculation.grandTotal;
  const customerDueBefore = bill.returnCustomerDueAtTime ?? 0;
  const duesAdjusted = bill.returnDuesAdjusted ?? 0;
  const newDueAfterReturn = Math.max(0, customerDueBefore - duesAdjusted);
  const cashToRefund = bill.returnAdjustmentMode === "CASH_REFUND" ? returnAmount : 0;
  const excessRefund = duesAdjusted > 0 && returnAmount > customerDueBefore
    ? returnAmount - customerDueBefore
    : 0;

  return (
    <div id="printable-bill-area" className="w-[300px] mx-auto bg-white text-slate-900 p-4 font-mono text-[11px] leading-tight border border-slate-300 shadow-md">
      {/* Center Header */}
      <div className="text-center pb-2 border-b border-dashed border-slate-900 mb-2">
        <h1 className="text-sm font-bold uppercase">{settings.storeName}</h1>
        <p className="text-[9px] text-slate-600">{settings.address}</p>
        <p className="text-[9px]">TEL: {settings.phone}</p>
        {settings.gstin && <p className="text-[9px]">GSTIN: {settings.gstin}</p>}
      </div>

      {/* Return Bill Badge */}
      {isReturn && (
        <div className="text-center mb-2 py-1 border border-dashed border-slate-700">
          <p className="font-bold text-[10px] uppercase tracking-widest">*** RETURN / CREDIT NOTE ***</p>
          {bill.parentInvoiceNo && (
            <p className="text-[9px] text-slate-600">Ref: {bill.parentInvoiceNo}</p>
          )}
          {bill.returnReason && (
            <p className="text-[9px] text-slate-500 italic">Reason: {bill.returnReason}</p>
          )}
        </div>
      )}

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
            {hasMeasurement && <th className="py-1 text-center">MEAS.</th>}
            <th className="py-1 text-right">AMT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {bill.items.map((item, idx) => {
            const totalMeas =
              item.measurementValue && item.measurementValue > 0
                ? (item.quantity * item.measurementValue).toFixed(2)
                : null;
            return (
              <tr key={idx}>
                <td className="py-1 max-w-[110px] truncate">{item.productName}</td>
                <td className="py-1 text-center">{item.quantity}</td>
                {hasMeasurement && (
                  <td className="py-1 text-center font-semibold">
                    {totalMeas ? `${totalMeas} ${item.measurementUnit ?? "SQM"}` : "—"}
                  </td>
                )}
                <td className="py-1 text-right font-semibold">{formatCurrency(item.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t border-dashed border-slate-900 pt-2 mb-2 space-y-1">
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
          <span>{isReturn ? "RETURN TOTAL:" : "TOTAL:"}</span>
          <span>{formatCurrency(bill.calculation.grandTotal)}</span>
        </div>
        {!isReturn && (
          <>
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
          </>
        )}
      </div>

      {/* Return Bill: DUE Balance Adjustment Section */}
      {isReturn && (
        <div className="border-t border-dashed border-slate-900 pt-2 mb-2 space-y-1">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-1">Balance Adjustment:</p>

          {/* Customer ka pehle ka due */}
          <div className="flex justify-between text-[10px]">
            <span>PREV. DUE (Before Return):</span>
            <span className="font-bold text-rose-700">{formatCurrency(customerDueBefore)}</span>
          </div>

          {/* Return amount */}
          <div className="flex justify-between text-[10px]">
            <span>RETURN CREDIT:</span>
            <span className="font-bold text-emerald-700">- {formatCurrency(returnAmount)}</span>
          </div>

          <div className="border-t border-slate-400 pt-1 mt-1">
            {bill.returnAdjustmentMode === "CASH_REFUND" ? (
              // Cash Refund mode
              <div className="flex justify-between text-xs font-bold text-emerald-700">
                <span>CASH TO REFUND:</span>
                <span>{formatCurrency(cashToRefund)}</span>
              </div>
            ) : newDueAfterReturn > 0 ? (
              // Due still remaining
              <div className="flex justify-between text-xs font-bold text-rose-700">
                <span>REMAINING DUE:</span>
                <span>{formatCurrency(newDueAfterReturn)}</span>
              </div>
            ) : excessRefund > 0 ? (
              // Return > due, extra cash back
              <>
                <div className="flex justify-between text-xs font-bold">
                  <span>DUE CLEARED:</span>
                  <span className="text-emerald-700">✓ ₹0</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-emerald-700">
                  <span>EXTRA CASH BACK:</span>
                  <span>{formatCurrency(excessRefund)}</span>
                </div>
              </>
            ) : (
              // Due exactly cleared
              <div className="flex justify-between text-xs font-bold text-emerald-700">
                <span>DUE CLEARED:</span>
                <span>✓ ₹0 REMAINING</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-center pt-1 text-[9px]">
        {isReturn ? (
          <>
            <p className="font-bold">RETURN PROCESSED SUCCESSFULLY</p>
            <p className="text-[8px] text-slate-500">KEEP THIS RECEIPT FOR RECORDS</p>
          </>
        ) : (
          <>
            <p className="font-bold">THANK YOU FOR YOUR VISIT!</p>
            <p className="text-[8px] text-slate-500">NO RETURN WITHOUT RECEIPT</p>
          </>
        )}
      </div>
    </div>
  );
};
