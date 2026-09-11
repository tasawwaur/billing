"use client";

import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Bill, BillItem } from "@/types/bill";
import { useBillingStore } from "@/store/billing-store";
import { useProductStore } from "@/store/product-store";
import { useCustomerStore } from "@/store/customer-store";
import { useLedgerStore } from "@/store/ledger-store";
import { formatCurrency } from "@/lib/currency";
import { Undo2, ArrowDownLeft, Banknote, Clock } from "lucide-react";

interface SalesReturnModalProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
  onReturnGenerated?: (returnBill: Bill) => void;
}

export const SalesReturnModal: React.FC<SalesReturnModalProps> = ({
  bill,
  isOpen,
  onClose,
  onReturnGenerated,
}) => {
  const { createReturnBill } = useBillingStore();
  const { restockStock } = useProductStore();
  const { customers, recordSalesReturn } = useCustomerStore();
  const { addLedgerEntry, addPaymentRecord, updatePendingDueRecord } = useLedgerStore();

  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [adjustmentMode, setAdjustmentMode] = useState<"ADJUST_DUE" | "CASH_REFUND" | "STORE_CREDIT">("ADJUST_DUE");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Match customer obj
  const customerObj = useMemo(() => {
    if (!bill) return null;
    return customers.find((c) => c.id === bill.customerId || c.phone === bill.customerPhone);
  }, [bill, customers]);

  const customerDueBalance = customerObj ? customerObj.dueBalance : (bill?.calculation?.dueAmount || 0);

  // Initialize return quantities when bill changes
  React.useEffect(() => {
    if (bill && bill.items) {
      const initial: Record<string, number> = {};
      bill.items.forEach((item) => {
        initial[item.productId || item.sku] = 0;
      });
      setReturnQuantities(initial);

      // Default adjustment mode: if customer has dues > 0, default to ADJUST_DUE, else CASH_REFUND
      if (customerDueBalance > 0 || bill.calculation.dueAmount > 0) {
        setAdjustmentMode("ADJUST_DUE");
      } else {
        setAdjustmentMode("CASH_REFUND");
      }
      setReason("");
    }
  }, [bill, customerDueBalance]);

  if (!bill) return null;

  // Calculate return totals
  const returnSummary = useMemo(() => {
    const returnedItemsList: BillItem[] = [];
    let returnSubtotal = 0;
    let returnTax = 0;
    let returnTotal = 0;

    bill.items.forEach((item) => {
      const key = item.productId || item.sku;
      const qty = returnQuantities[key] || 0;
      if (qty > 0) {
        const itemUnitPrice = item.price;
        let itemDiscount = 0;
        if (item.discount > 0) {
          itemDiscount = item.discountType === "percentage" ? (itemUnitPrice * item.discount) / 100 : item.discount;
        }
        const effectivePrice = Math.max(0, itemUnitPrice - itemDiscount);
        const lineSubtotal = effectivePrice * qty;
        const lineTax = (lineSubtotal * item.taxRate) / 100;
        const lineTotal = lineSubtotal + lineTax;

        returnSubtotal += lineSubtotal;
        returnTax += lineTax;
        returnTotal += lineTotal;

        returnedItemsList.push({
          ...item,
          quantity: qty,
          taxAmount: lineTax,
          total: lineTotal,
        });
      }
    });

    return {
      items: returnedItemsList,
      returnSubtotal: Math.round(returnSubtotal * 100) / 100,
      returnTax: Math.round(returnTax * 100) / 100,
      returnTotal: Math.round(returnTotal * 100) / 100,
    };
  }, [bill, returnQuantities]);

  const { items: returnedItemsList, returnTotal } = returnSummary;

  // Breakdown of return total according to chosen adjustment mode
  const adjustDuesAmount = adjustmentMode === "ADJUST_DUE" ? Math.min(returnTotal, customerDueBalance) : 0;
  const storeCreditAmount = adjustmentMode === "STORE_CREDIT" ? returnTotal : (adjustmentMode === "ADJUST_DUE" && returnTotal > customerDueBalance ? returnTotal - customerDueBalance : 0);
  const cashRefundAmount = adjustmentMode === "CASH_REFUND" ? returnTotal : 0;

  const handleQtyChange = (key: string, maxQty: number, value: number) => {
    const safeVal = Math.min(maxQty, Math.max(0, value));
    setReturnQuantities((prev) => ({
      ...prev,
      [key]: safeVal,
    }));
  };

  const handleSelectAll = () => {
    const full: Record<string, number> = {};
    bill.items.forEach((item) => {
      full[item.productId || item.sku] = item.quantity;
    });
    setReturnQuantities(full);
  };

  const handleClearAll = () => {
    const empty: Record<string, number> = {};
    bill.items.forEach((item) => {
      empty[item.productId || item.sku] = 0;
    });
    setReturnQuantities(empty);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (returnedItemsList.length === 0 || returnTotal <= 0) return;
    setIsSubmitting(true);

    try {
      // 1. Create Return Credit Note Bill
      const returnBill = createReturnBill({
        originalBill: bill,
        returnedItems: returnedItemsList,
        adjustmentMode,
        returnReason: reason || "Customer Item Return",
        returnTotal,
        adjustDuesAmount,
        cashRefundAmount,
        storeCreditAmount,
        customerDueAtTime: customerDueBalance,
      });

      if (returnBill) {
        // 2. Restock returned products back to inventory
        restockStock(returnedItemsList.map((i) => ({ productId: i.productId, quantity: i.quantity })));

        // 3. Update Customer CRM Account
        if (bill.customerId) {
          recordSalesReturn(bill.customerId, returnTotal, adjustDuesAmount, storeCreditAmount);
        }

        // 4. Update Khata Ledger
        addLedgerEntry({
          partyId: bill.customerId || "walkin",
          partyName: bill.customerName,
          partyType: "CUSTOMER",
          type: "CREDIT",
          amount: returnTotal,
          runningBalance: Math.max(0, customerDueBalance - adjustDuesAmount),
          referenceNo: returnBill.invoiceNo,
          description: `Sales Return Credit Note for ${bill.invoiceNo} (${adjustmentMode === "ADJUST_DUE" ? "Dues Adjusted" : adjustmentMode === "CASH_REFUND" ? "Cash Refund" : "Store Credit"})`,
        });

        if (adjustDuesAmount > 0) {
          const remainingDue = Math.max(0, (bill.calculation?.dueAmount || 0) - adjustDuesAmount);
          updatePendingDueRecord(bill.invoiceNo, remainingDue);
        }

        // 5. Update Payments Stream if Cash Refund or Dues adjustment
        if (cashRefundAmount > 0) {
          addPaymentRecord({
            billId: returnBill.id,
            invoiceNo: returnBill.invoiceNo,
            customerId: bill.customerId || "walkin",
            customerName: bill.customerName,
            customerPhone: bill.customerPhone,
            amount: cashRefundAmount,
            method: "CASH",
            type: "PAID",
            referenceNo: `REFUND-${returnBill.invoiceNo}`,
            status: "COMPLETED",
            notes: `Cash Refund paid to customer for Return ${returnBill.invoiceNo}`,
          });
        }

        onClose();
        if (onReturnGenerated) {
          onReturnGenerated(returnBill);
        }
      }
    } catch (err) {
      console.error("Failed to generate return bill:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sales Return / Item Wapas - ${bill.invoiceNo}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmitReturn} className="space-y-4">
        {/* Customer & Original Invoice Info Header Card */}
        <div className="p-3 bg-obsidian-900 rounded-xl border border-gold-500/20 text-xs space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-100 text-sm">{bill.customerName}</span>
            <span className="font-mono text-gold-400 font-bold">{bill.invoiceNo}</span>
          </div>
          <div className="flex flex-wrap justify-between text-slate-400 gap-2">
            <span>Phone: <strong className="text-slate-200">{bill.customerPhone || "N/A"}</strong></span>
            <span>Original Total: <strong className="text-emerald-400">{formatCurrency(bill.calculation.grandTotal)}</strong></span>
            <span>Current Dues: <strong className="text-rose-400">{formatCurrency(customerDueBalance)}</strong></span>
          </div>
        </div>

        {/* Item Selection Header */}
        <div className="flex justify-between items-center text-xs">
          <span className="font-extrabold uppercase tracking-wider text-slate-300">
            1. Select Items & Quantities to Return
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[10px] text-gold-400 font-bold hover:underline cursor-pointer"
            >
              Select All
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[10px] text-slate-400 hover:underline cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Items Table / List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {bill.items.map((item) => {
            const key = item.productId || item.sku;
            const currentReturnQty = returnQuantities[key] || 0;
            return (
              <div
                key={key}
                className={`p-3 rounded-xl border transition-all text-xs flex flex-wrap justify-between items-center gap-2 ${
                  currentReturnQty > 0
                    ? "bg-gold-500/10 border-gold-500/50 text-slate-100"
                    : "bg-obsidian-950 border-gold-500/15 text-slate-400"
                }`}
              >
                <div className="flex-1 min-w-[180px]">
                  <h6 className="font-bold text-slate-100">{item.productName}</h6>
                  <p className="text-[10px] text-slate-400 font-mono">
                    SKU: {item.sku} | Price: {formatCurrency(item.price)} ({item.taxRate}% GST)
                  </p>
                  <p className="text-[10px] text-slate-300">Purchased Qty: <strong>{item.quantity} {item.unit}</strong></p>
                </div>

                {/* Qty Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-300">Return Qty:</span>
                  <div className="flex items-center border border-gold-500/30 rounded-lg overflow-hidden bg-obsidian-900">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(key, item.quantity, currentReturnQty - 1)}
                      className="px-2.5 py-1 text-gold-400 font-bold hover:bg-gold-500/20 active:scale-95 transition-all"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={currentReturnQty}
                      onChange={(e) => handleQtyChange(key, item.quantity, Number(e.target.value))}
                      className="w-12 text-center bg-transparent text-gold-300 font-extrabold focus:outline-none text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleQtyChange(key, item.quantity, currentReturnQty + 1)}
                      className="px-2.5 py-1 text-gold-400 font-bold hover:bg-gold-500/20 active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Adjustment Mode Selector */}
        {returnTotal > 0 && (
          <div className="space-y-2 pt-2 border-t border-gold-500/15">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              2. How should Return Amount ({formatCurrency(returnTotal)}) be adjusted?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Option A: Adjust Dues */}
              <button
                type="button"
                onClick={() => setAdjustmentMode("ADJUST_DUE")}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                  adjustmentMode === "ADJUST_DUE"
                    ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-md scale-102"
                    : "bg-obsidian-900 border-gold-500/15 text-slate-400 hover:text-slate-200"
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-rose-400" />
                <span>Adjust Dues (Udhar Kam Karo)</span>
                <span className="text-[9px] font-mono text-slate-400 font-normal">
                  {customerDueBalance > 0 ? `Dues: ${formatCurrency(customerDueBalance)}` : "No Active Dues"}
                </span>
              </button>

              {/* Option B: Cash Refund */}
              <button
                type="button"
                onClick={() => setAdjustmentMode("CASH_REFUND")}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                  adjustmentMode === "CASH_REFUND"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md scale-102"
                    : "bg-obsidian-900 border-gold-500/15 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>Cash Refund (Wapas Cash Do)</span>
                <span className="text-[9px] font-mono text-slate-400 font-normal">Instant Cash Payment</span>
              </button>

              {/* Option C: Store Credit */}
              <button
                type="button"
                onClick={() => setAdjustmentMode("STORE_CREDIT")}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer ${
                  adjustmentMode === "STORE_CREDIT"
                    ? "bg-blue-500/20 border-blue-500 text-blue-300 shadow-md scale-102"
                    : "bg-obsidian-900 border-gold-500/15 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Store Credit (Khata Deposit)</span>
                <span className="text-[9px] font-mono text-slate-400 font-normal">Add to Dena Balance</span>
              </button>
            </div>
          </div>
        )}

        {/* Calculation Summary Box */}
        {returnTotal > 0 && (
          <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl text-xs space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Total Items Returned:</span>
              <strong className="text-slate-100">{returnedItemsList.length} item(s)</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Return Tax Reversal (GST):</span>
              <strong className="text-gold-400">{formatCurrency(returnSummary.returnTax)}</strong>
            </div>
            <div className="flex justify-between text-slate-100 font-extrabold text-sm border-t border-gold-500/20 pt-1">
              <span>Total Return Credit Amount:</span>
              <span className="text-gold-300">{formatCurrency(returnTotal)}</span>
            </div>

            {/* Mode specific effect summary */}
            {adjustmentMode === "ADJUST_DUE" && (
              <div className="text-[11px] text-rose-300 pt-1 font-semibold border-t border-gold-500/15">
                • Dues Adjusted: {formatCurrency(adjustDuesAmount)}
                {storeCreditAmount > 0 && ` | Extra Credit added to Khata: ${formatCurrency(storeCreditAmount)}`}
                <span className="block text-[10px] text-slate-400">
                  New Customer Due Balance: {formatCurrency(Math.max(0, customerDueBalance - adjustDuesAmount))}
                </span>
              </div>
            )}
            {adjustmentMode === "CASH_REFUND" && (
              <div className="text-[11px] text-emerald-300 pt-1 font-semibold border-t border-gold-500/15">
                • Cash Refund to Customer: {formatCurrency(cashRefundAmount)}
              </div>
            )}
            {adjustmentMode === "STORE_CREDIT" && (
              <div className="text-[11px] text-blue-300 pt-1 font-semibold border-t border-gold-500/15">
                • Added to Customer Dena Balance (Khata Store Credit): {formatCurrency(storeCreditAmount)}
              </div>
            )}
          </div>
        )}

        {/* Reason / Remarks */}
        <Input
          label="Return Reason / Remarks (Optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Defective item, customer exchange, size mismatch..."
        />

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1" type="button">
            Cancel
          </Button>
          <Button
            variant="gold"
            type="submit"
            disabled={returnedItemsList.length === 0 || returnTotal <= 0 || isSubmitting}
            className="flex-1 font-bold"
            icon={<Undo2 className="w-4 h-4" />}
          >
            {isSubmitting ? "Generating Return Bill..." : `Generate Return Bill (${formatCurrency(returnTotal)})`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
