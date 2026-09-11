"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/currency";

interface CompactBill {
  inv: string;
  store: string;
  addr: string;
  phone: string;
  gstin?: string;
  cust: string;
  custPhone: string;
  date: string;
  method: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  due: number;
  items: { n: string; q: number; u: string; p: number; tax: number; t: number; mVal?: number; mUnit?: string }[];
  transport?: { veh?: string; lr?: string; name?: string; dest?: string; freight?: string };
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return dateStr; }
}
function formatTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

export default function InvoicePage() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("d");

  let bill: CompactBill | null = null;
  let decodeError = false;

  if (dataParam) {
    try {
      const json = atob(dataParam);
      bill = JSON.parse(json);
    } catch {
      decodeError = true;
    }
  }

  if (!dataParam || decodeError || !bill) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Invoice Not Found</h1>
          <p className="text-sm text-slate-500">QR code invalid ya purana hai.</p>
          <p className="text-xs text-slate-400 mt-3">Please check the QR code on your bill.</p>
        </div>
      </div>
    );
  }

  const hasMeasurement = bill.items.some((i) => i.mVal && i.mVal > 0);
  const hasTransport = bill.transport && Object.values(bill.transport).some(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-amber-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#d4af37] overflow-hidden">
          <div className="bg-[#0b0f17] px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-extrabold text-[#d4af37] uppercase tracking-wide">{bill.store}</h1>
              <p className="text-[10px] text-[#a08832] mt-0.5">{bill.addr}</p>
              <p className="text-[10px] text-[#a08832]">Ph: {bill.phone}{bill.gstin ? ` | GSTIN: ${bill.gstin}` : ""}</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider bg-[#d4af37] text-[#0b0f17]">
              TAX INVOICE
            </span>
          </div>

          {/* Invoice Meta */}
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 text-[10px]">Invoice No.</p>
                <p className="font-mono font-bold text-slate-800 text-lg">{bill.inv}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px]">Date & Time</p>
                <p className="font-semibold text-slate-800">{formatDate(bill.date)}</p>
                <p className="text-slate-500 text-[10px]">{formatTime(bill.date)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Customer</p>
                <p className="font-bold text-slate-800">{bill.cust}</p>
                {bill.custPhone && <p className="text-slate-500 text-[10px]">{bill.custPhone}</p>}
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px]">Payment</p>
                <p className="font-bold text-slate-800">{bill.method}</p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase mt-1 ${
                  bill.status === "PAID" ? "bg-emerald-100 text-emerald-700" :
                  bill.status === "DUE" ? "bg-rose-100 text-rose-700" :
                  "bg-amber-100 text-amber-700"
                }`}>{bill.status}</span>
              </div>
            </div>
          </div>

          {/* Transport Details */}
          {hasTransport && bill.transport && (
            <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
              <p className="text-[9px] font-bold text-[#785816] uppercase tracking-wider mb-1.5">Transport / Delivery Details</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                {bill.transport.veh && <span><span className="text-slate-400">Vehicle:</span> <span className="font-bold text-slate-700">{bill.transport.veh}</span></span>}
                {bill.transport.lr && <span><span className="text-slate-400">LR No:</span> <span className="font-bold text-slate-700">{bill.transport.lr}</span></span>}
                {bill.transport.name && <span><span className="text-slate-400">Transport:</span> <span className="font-bold text-slate-700">{bill.transport.name}</span></span>}
                {bill.transport.dest && <span><span className="text-slate-400">Destination:</span> <span className="font-bold text-slate-700">{bill.transport.dest}</span></span>}
                {bill.transport.freight && <span><span className="text-slate-400">Freight:</span> <span className="font-bold text-slate-700">{bill.transport.freight}</span></span>}
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="px-6 py-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-[#d4af37] text-[10px] text-slate-500 uppercase">
                  <th className="pb-2 text-left font-bold">#</th>
                  <th className="pb-2 text-left font-bold">Item</th>
                  <th className="pb-2 text-center font-bold">Qty</th>
                  {hasMeasurement && <th className="pb-2 text-center font-bold">Meas.</th>}
                  <th className="pb-2 text-right font-bold">Price</th>
                  <th className="pb-2 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items.map((item, idx) => {
                  const totalMeas = item.mVal && item.mVal > 0 ? (item.q * item.mVal).toFixed(2) : null;
                  return (
                    <tr key={idx} className="text-slate-700">
                      <td className="py-2 text-slate-400">{idx + 1}</td>
                      <td className="py-2">
                        <p className="font-semibold text-slate-800">{item.n}</p>
                        <p className="text-[9px] text-slate-400">GST: {item.tax}%</p>
                      </td>
                      <td className="py-2 text-center font-semibold">{item.q} {item.u}</td>
                      {hasMeasurement && (
                        <td className="py-2 text-center text-slate-500">
                          {totalMeas ? `${totalMeas} ${item.mUnit ?? "SQM"}` : "—"}
                        </td>
                      )}
                      <td className="py-2 text-right font-mono">{formatCurrency(item.p)}</td>
                      <td className="py-2 text-right font-bold font-mono">{formatCurrency(item.t)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-6 pb-6">
            <div className="ml-auto max-w-xs space-y-1.5 text-xs border-t border-slate-200 pt-3">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-700">{formatCurrency(bill.subtotal)}</span>
              </div>
              {bill.tax > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>GST Tax</span>
                  <span className="font-mono font-semibold text-slate-700">{formatCurrency(bill.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm border-t-2 border-[#d4af37] pt-2 mt-2">
                <span className="text-slate-800">Grand Total</span>
                <span className="text-[#926f1a] font-mono text-base">{formatCurrency(bill.total)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Paid</span>
                <span className="font-mono font-semibold text-emerald-600">{formatCurrency(bill.paid)}</span>
              </div>
              {bill.due > 0 && (
                <div className="flex justify-between font-bold text-rose-700 bg-rose-50 rounded-lg px-3 py-1.5">
                  <span>Balance Due</span>
                  <span className="font-mono">{formatCurrency(bill.due)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pb-6">
          <p className="font-semibold text-slate-500">{bill.store}</p>
          <p>{bill.addr}</p>
          <p className="mt-1">Thank you for your business! 🙏</p>
        </div>
      </div>
    </div>
  );
}
