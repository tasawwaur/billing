"use client";

import React, { useState } from "react";
import { useBillingStore } from "@/store/billing-store";
import { useProductStore } from "@/store/product-store";
import { useCustomerStore } from "@/store/customer-store";
import { useSettingsStore } from "@/store/settings-store";
import { useLedgerStore } from "@/store/ledger-store";
import { ProductSelector } from "./ProductSelector";
import { CustomerSelector } from "./CustomerSelector";
import { Cart } from "./Cart";
import { DiscountInput } from "./DiscountInput";
import { PaymentSection } from "./PaymentSection";
import { BillSummary } from "./BillSummary";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { BillTemplateA4 } from "@/components/bills/BillTemplateA4";
import { calculateInvoice } from "@/lib/invoice";
import { Printer, CheckCircle2, MessageCircle, Image as ImageIcon } from "lucide-react";
import { sendInvoiceWhatsApp } from "@/lib/whatsapp";
import { downloadInvoiceAsImage } from "@/lib/image-export";
import { Bill } from "@/types/bill";
import { formatCurrency } from "@/lib/currency";

export const BillingForm: React.FC = () => {
  const { products, reduceStock } = useProductStore();
  const { customers, addCustomer, recordPurchase } = useCustomerStore();
  const { settings } = useSettingsStore();
  const { addLedgerEntry, addPaymentRecord } = useLedgerStore();
  const {
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    selectedCustomerId,
    setCustomer,
    orderDiscountPercent,
    setOrderDiscount,
    paymentMethod,
    setPaymentMethod,
    paidAmountInput,
    saveCurrentBill,
  } = useBillingStore();

  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const calculation = calculateInvoice(cart, orderDiscountPercent, paymentMethod === "CREDIT" ? 0 : paidAmountInput || undefined);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const bill = saveCurrentBill(settings.activeTemplate);
    if (bill) {
      reduceStock(bill.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
      recordPurchase(bill.customerId, bill.calculation.grandTotal, bill.calculation.dueAmount);
      if (bill.calculation.dueAmount > 0) {
        addLedgerEntry({
          partyId: bill.customerId,
          partyName: bill.customerName,
          partyType: "CUSTOMER",
          type: "DEBIT",
          amount: bill.calculation.dueAmount,
          runningBalance: selectedCustomerObj ? selectedCustomerObj.dueBalance + bill.calculation.dueAmount : bill.calculation.dueAmount,
          referenceNo: bill.invoiceNo,
          description: `Due balance for ${bill.invoiceNo}`,
        });
      }
      if (bill.calculation.paidAmount > 0) {
        addPaymentRecord({
          billId: bill.id,
          invoiceNo: bill.invoiceNo,
          customerId: bill.customerId,
          customerName: bill.customerName,
          amount: bill.calculation.paidAmount,
          method: bill.paymentMethod === "CREDIT" ? "CASH" : (bill.paymentMethod as any),
          referenceNo: `POS-${bill.invoiceNo}`,
        });
      }
      setGeneratedBill(bill);
    }
  };

  const handlePrintGeneratedBill = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      {/* Left: Product Catalog Selector (7 Cols) */}
      <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-gold-500/20 h-full flex flex-col justify-between">
        <h3 className="text-sm font-extrabold text-slate-100 gold-gradient-text mb-2 uppercase tracking-wider">
          Point of Sale Catalog
        </h3>
        <ProductSelector products={products} onSelectProduct={(p) => addToCart(p, 1)} />
      </div>

      {/* Right: POS Order Cart & Checkout (5 Cols) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Customer Selection */}
        <CustomerSelector
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={(c) => setCustomer(c.id, c.name, c.phone)}
          onAddCustomer={addCustomer}
        />

        {/* Cart items */}
        <div className="glass-panel p-4 rounded-2xl border border-gold-500/20 space-y-3">
          <Cart
            items={cart}
            onUpdateQty={updateCartQuantity}
            onRemove={removeFromCart}
            onClearCart={clearCart}
          />
          {cart.length > 0 && (
            <>
              <DiscountInput
                orderDiscountPercent={orderDiscountPercent}
                onChangeDiscount={setOrderDiscount}
              />
              <PaymentSection
                paymentMethod={paymentMethod}
                onSelectMethod={setPaymentMethod}
              />
              <BillSummary calculation={calculation} />

              <Button
                variant="gold"
                size="lg"
                onClick={handleCheckout}
                className="w-full text-base font-extrabold shadow-gold"
                icon={<CheckCircle2 className="w-5 h-5" />}
              >
                Complete Sale & Generate Bill ({formatCurrency(calculation.grandTotal)})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Generated Bill Popup Modal */}
      {generatedBill && (
        <Modal
          isOpen={!!generatedBill}
          onClose={() => setGeneratedBill(null)}
          title={`Invoice Generated Successfully - ${generatedBill.invoiceNo}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Invoice saved and stock updated!</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => downloadInvoiceAsImage(generatedBill.invoiceNo, generatedBill.customerName)}
                  icon={<ImageIcon className="w-4 h-4 text-amber-400" />}
                >
                  Download Image PNG
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => sendInvoiceWhatsApp(generatedBill, settings)}
                  icon={<MessageCircle className="w-4 h-4 text-emerald-400" />}
                >
                  WhatsApp
                </Button>
                <Button variant="gold" size="sm" onClick={handlePrintGeneratedBill} icon={<Printer className="w-4 h-4" />}>
                  Print / Save PDF
                </Button>
              </div>
            </div>

            <div className="max-h-[65vh] overflow-y-auto rounded-xl border border-slate-200">
              <BillTemplateA4 bill={generatedBill} settings={settings} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
