"use client";

import React, { useState } from "react";
import { PaymentRecord } from "@/types/payment";
import { useBillingStore } from "@/store/billing-store";
import { useCustomerStore } from "@/store/customer-store";
import { useLedgerStore } from "@/store/ledger-store";
import { useSettingsStore } from "@/store/settings-store";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BillTemplateA4 } from "@/components/bills/BillTemplateA4";
import { PaymentReceiptTemplate } from "./PaymentReceiptTemplate";
import { normalizeIndianMobile, sendInvoiceWhatsApp } from "@/lib/whatsapp";
import { formatCurrency, formatDate, formatTime } from "@/lib/currency";
import { CustomerAccountDrawer } from "@/components/customers/CustomerAccountDrawer";
import { Bill } from "@/types/bill";
import {
  X,
  Printer,
  FileText,
  MessageCircle,
  User,
  RotateCcw,
  Eye,
  Download,
} from "lucide-react";

interface PaymentDetailDrawerProps {
  payment: PaymentRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentDetailDrawer: React.FC<PaymentDetailDrawerProps> = ({
  payment,
  isOpen,
  onClose,
}) => {
  const { bills } = useBillingStore();
  const { customers, recordPayment } = useCustomerStore();
  const { reversePaymentRecord, addLedgerEntry } = useLedgerStore();
  const { settings } = useSettingsStore();

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCustomerDrawer, setShowCustomerDrawer] = useState(false);

  if (!isOpen || !payment) return null;

  const matchedCustomer = customers.find((c) => c.id === payment.customerId || c.name === payment.customerName);
  const matchedBill = bills.find((b) => b.invoiceNo === payment.invoiceNo || b.id === payment.billId);
  const normalizedPhone = normalizeIndianMobile(payment.customerPhone || matchedCustomer?.phone || "");

  const handleReversePayment = () => {
    if (confirm(`Are you sure you want to refund/reverse payment ${payment.referenceNo || payment.id} of ₹${payment.amount}? This will restore the customer due balance.`)) {
      const reversed = reversePaymentRecord(payment.id);
      if (reversed) {
        if (payment.customerId) {
          recordPayment(payment.customerId, -payment.amount);
        }
        addLedgerEntry({
          partyId: payment.customerId,
          partyName: payment.customerName,
          partyType: "CUSTOMER",
          type: "DEBIT",
          amount: payment.amount,
          runningBalance: (matchedCustomer?.dueBalance || 0) + payment.amount,
          referenceNo: `REV-PAY-${payment.referenceNo || payment.id}`,
          description: `Payment refund reversal for ${payment.invoiceNo}`,
        });
      }
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md">
        <div className="w-full max-w-lg bg-obsidian-950 border-l border-gold-500/30 shadow-glass h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gold-500/20 bg-obsidian-900/60 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-400">
                Payment Transaction Audit
              </span>
              <h2 className="text-xl font-extrabold text-slate-100 uppercase font-mono">
                {payment.referenceNo || payment.id}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-gold-400 hover:bg-obsidian-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Amount Banner */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Payment Received</span>
              <h3 className="text-3xl font-extrabold text-emerald-300">{formatCurrency(payment.amount)}</h3>
              <div className="pt-2 flex justify-center gap-2">
                <Badge variant={payment.status === "COMPLETED" ? "paid" : payment.status === "REFUNDED" ? "due" : "neutral"}>
                  {payment.status}
                </Badge>
                <Badge variant="gold">{payment.method}</Badge>
              </div>
            </div>

            {/* Details Grid */}
            <div className="glass-panel p-4 rounded-xl border border-gold-500/15 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gold-500/10">
                <span className="text-slate-400">Customer Name:</span>
                <span className="font-bold text-slate-100">{payment.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gold-500/10">
                <span className="text-slate-400">Mobile Number:</span>
                <span className="font-mono text-slate-200">{normalizedPhone || "-"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gold-500/10">
                <span className="text-slate-400">Invoice Number:</span>
                <span className="font-mono font-bold text-gold-400">{payment.invoiceNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gold-500/10">
                <span className="text-slate-400">Reference ID:</span>
                <span className="font-mono text-slate-300">{payment.referenceNo || "-"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gold-500/10">
                <span className="text-slate-400">Date & Time:</span>
                <span className="text-slate-300">
                  {formatDate(payment.date)} • {formatTime(payment.date)}
                </span>
              </div>
              {payment.notes && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Notes:</span>
                  <span className="text-slate-300">{payment.notes}</span>
                </div>
              )}
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {matchedBill && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowInvoiceModal(true)}
                  icon={<Eye className="w-4 h-4 text-gold-400" />}
                >
                  View Invoice
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowReceiptModal(true)}
                icon={<FileText className="w-4 h-4 text-blue-400" />}
              >
                PDF Receipt
              </Button>
              {matchedCustomer && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCustomerDrawer(true)}
                  icon={<User className="w-4 h-4 text-emerald-400" />}
                >
                  Customer Account
                </Button>
              )}
              {matchedBill && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => sendInvoiceWhatsApp(matchedBill, settings)}
                  icon={<MessageCircle className="w-4 h-4 text-emerald-400" />}
                >
                  WhatsApp
                </Button>
              )}
            </div>

            {/* Reversal / Refund Action */}
            {payment.status !== "REFUNDED" && (
              <div className="pt-4 border-t border-rose-500/20">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleReversePayment}
                  className="w-full text-xs font-bold"
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  Refund / Reverse Payment
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && matchedBill && (
        <Modal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} title={`Invoice ${matchedBill.invoiceNo}`} maxWidth="2xl">
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button variant="gold" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                Print Invoice
              </Button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto rounded-xl border border-slate-200">
              <BillTemplateA4 bill={matchedBill} settings={settings} />
            </div>
          </div>
        </Modal>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <Modal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} title={`Payment Receipt - ${payment.referenceNo || payment.id}`} maxWidth="lg">
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button variant="gold" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                Print Receipt
              </Button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto rounded-xl border border-slate-200">
              <PaymentReceiptTemplate payment={payment} settings={settings} dueBefore={matchedCustomer?.dueBalance || 0} />
            </div>
          </div>
        </Modal>
      )}

      {/* Customer Account Statement Drawer */}
      {showCustomerDrawer && matchedCustomer && (
        <CustomerAccountDrawer
          customer={matchedCustomer}
          isOpen={showCustomerDrawer}
          onClose={() => setShowCustomerDrawer(false)}
        />
      )}
    </>
  );
};
