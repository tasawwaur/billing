"use client";

import React, { useState, useEffect } from "react";
import { useBillingStore } from "@/store/billing-store";
import { useProductStore } from "@/store/product-store";
import { useCustomerStore } from "@/store/customer-store";
import { useSettingsStore } from "@/store/settings-store";
import { useLedgerStore } from "@/store/ledger-store";
import { ProductSelector } from "./ProductSelector";
import { CustomerSelector } from "./CustomerSelector";
import { Cart } from "./Cart";
import { GstSelector } from "./GstSelector";
import { DiscountInput } from "./DiscountInput";
import { PaymentSection } from "./PaymentSection";
import { BillSummary } from "./BillSummary";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { BillTemplateA4 } from "@/components/bills/BillTemplateA4";
import { BillTemplateLuxuryGold } from "@/components/bills/BillTemplateLuxuryGold";
import { calculateInvoice } from "@/lib/invoice";
import {
  Printer,
  CheckCircle2,
  MessageCircle,
  Image as ImageIcon,
  Copy,
  Package,
  ShoppingCart,
  Share,
  ArrowRight,
  Truck,
} from "lucide-react";
import { sendInvoiceWhatsApp, openWhatsAppDirect, shareInvoiceJpgDirect } from "@/lib/whatsapp";
import { copyInvoiceImageToClipboard, downloadInvoiceAsImage } from "@/lib/image-export";
import { BillActionToolbar } from "@/components/bills/BillActionToolbar";
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
    updateCartItemPrice,
    updateCartItemTaxRate,
    updateCartItemMeasurement,
    applyGlobalGstRate,
    removeFromCart,
    clearCart,
    selectedCustomerId,
    selectedCustomerName,
    selectedCustomerPhone,
    setCustomer,
    orderDiscountPercent,
    setOrderDiscount,
    paymentMethod,
    setPaymentMethod,
    paidAmountInput,
    setPaidAmountInput,
    saveCurrentBill,
    transportVehicleNo,
    transportLrNo,
    transportName,
    transportDestination,
    transportFreightTerms,
    setTransportDetails,
    eInvoiceAckNo,
    eWayBillNo,
    eWayBillValidTill,
    setEInvoiceDetails,
    bankAccountName,
    bankName,
    bankAccountNo,
    bankIfscCode,
    setBankDetails,
  } = useBillingStore();

  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [isJpgCopied, setIsJpgCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<"catalog" | "cart">("catalog");
  const [isMobile, setIsMobile] = useState(false);
  const [showTransport, setShowTransport] = useState(false);
  const [showEInvoice, setShowEInvoice] = useState(false);
  const [showBank, setShowBank] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || "") || window.innerWidth < 768;
      setIsMobile(mobile);
    }
  }, []);

  // When an item is added on mobile, if user was looking at empty cart, stay on catalog with floating bar
  const handleAddToCart = (prod: any) => {
    addToCart(prod, 1);
  };

  // Auto copy HD Bill Image to Clipboard and Auto-Download JPG when invoice is generated
  useEffect(() => {
    if (generatedBill) {
      setIsJpgCopied(false);
      const timer = setTimeout(async () => {
        try {
          const ok = await copyInvoiceImageToClipboard("printable-bill-area");
          if (ok) {
            setIsJpgCopied(true);
          }
          await downloadInvoiceAsImage(
            generatedBill.invoiceNo,
            generatedBill.customerName,
            "printable-bill-area"
          );
        } catch (err) {
          console.warn("Auto copy/download image error:", err);
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [generatedBill]);

  const selectedCustomerObj =
    customers.find((c) => c.id === selectedCustomerId) ||
    (customers[0] ?? {
      id: "walkin",
      name: "Walk-in Customer",
      phone: settings.phone || "9072220785",
      dueBalance: 0,
      denaBalance: 0,
      totalBills: 0,
      totalSpent: 0,
      createdAt: "",
    });

  const effectivePaid =
    paidAmountInput !== null && paidAmountInput !== undefined
      ? paidAmountInput
      : paymentMethod === "CREDIT"
      ? 0
      : undefined;

  const calculation = calculateInvoice(cart, orderDiscountPercent, effectivePaid);

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

        addPaymentRecord({
          billId: bill.id,
          invoiceNo: bill.invoiceNo,
          customerId: bill.customerId,
          customerName: bill.customerName,
          customerPhone: bill.customerPhone,
          amount: bill.calculation.dueAmount,
          method: bill.paymentMethod === "CREDIT" ? "CASH" : (bill.paymentMethod as any),
          referenceNo: `DUE-${bill.invoiceNo}`,
          status: "PENDING",
          notes: `Pending Due / Udhar balance for ${bill.invoiceNo}`,
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

      // Instant WhatsApp launch to customer's phone if provided
      if (bill.customerPhone && bill.customerPhone.trim() !== "") {
        openWhatsAppDirect(bill, settings, bill.customerPhone);
      }
    }
  };

  const totalCartQty = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-3">
      {/* 1. Mobile Segmented Tab Switcher (Visible on Phones & Tablets) */}
      <div className="lg:hidden flex items-center p-1 bg-obsidian-900 border border-gold-500/20 rounded-xl">
        <button
          type="button"
          onClick={() => setMobileTab("catalog")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "catalog"
              ? "bg-gold-500 text-obsidian-950 shadow-gold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catalog ({products.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("cart")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "cart"
              ? "bg-gold-500 text-obsidian-950 shadow-gold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart ({cart.length})</span>
          {cart.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                mobileTab === "cart"
                  ? "bg-obsidian-950 text-gold-300"
                  : "bg-gold-500/20 text-gold-300"
              }`}
            >
              {formatCurrency(calculation.grandTotal)}
            </span>
          )}
        </button>
      </div>

      {/* 2. Main POS Grid (2 Columns on PC, Tab-Switched on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Product Catalog (Visible on PC or when Catalog tab selected on Mobile) */}
        <div
          className={`lg:col-span-7 glass-panel p-3.5 sm:p-5 rounded-2xl border border-gold-500/20 flex flex-col justify-between ${
            mobileTab === "catalog" ? "block" : "hidden lg:flex"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-100 gold-gradient-text uppercase tracking-wider">
              Point of Sale Catalog
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">
              {products.length} Products in Stock
            </span>
          </div>
          <ProductSelector products={products} onSelectProduct={handleAddToCart} />
        </div>

        {/* Right Column: POS Cart & Checkout (Visible on PC or when Cart tab selected on Mobile) */}
        <div
          className={`lg:col-span-5 space-y-3 ${
            mobileTab === "cart" ? "block" : "hidden lg:block"
          }`}
        >
          {/* Customer Selection */}
          <CustomerSelector
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            selectedCustomerName={selectedCustomerName}
            selectedCustomerPhone={selectedCustomerPhone}
            onSelectCustomer={(c) => setCustomer(c.id, c.name, c.phone)}
            onUpdateCustomerInfo={(name, phone) => setCustomer(selectedCustomerId, name, phone)}
            onAddCustomer={addCustomer}
          />

          {/* Cart items */}
          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-gold-500/20 space-y-3">
            <Cart
              items={cart}
              onUpdateQty={updateCartQuantity}
              onUpdatePrice={updateCartItemPrice}
              onUpdateTaxRate={updateCartItemTaxRate}
              onUpdateMeasurement={updateCartItemMeasurement}
              onRemove={removeFromCart}
              onClearCart={clearCart}
            />
            {cart.length > 0 && (
              <>
                <GstSelector
                  cartTaxRates={cart.map((item) => item.taxRate)}
                  onApplyGlobalGst={applyGlobalGstRate}
                />
                <DiscountInput
                  orderDiscountPercent={orderDiscountPercent}
                  onChangeDiscount={setOrderDiscount}
                />
                <PaymentSection
                  paymentMethod={paymentMethod}
                  onSelectMethod={setPaymentMethod}
                  grandTotal={calculation.grandTotal}
                  paidAmountInput={paidAmountInput}
                  onChangePaidAmount={setPaidAmountInput}
                />

                {/* Transport / Vehicle Details (Optional) */}
                <div className="rounded-xl border border-gold-500/15 bg-obsidian-900/40 overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-gold-400 hover:text-gold-300 transition-colors"
                    onClick={() => setShowTransport((v) => !v)}
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5" />
                      Transport / Vehicle Details
                      <span className="text-slate-500 font-normal">(Optional)</span>
                    </span>
                    <span className="text-slate-400">{showTransport ? "▲" : "▼"}</span>
                  </button>
                  {showTransport && (
                    <div className="px-3.5 pb-3.5 space-y-2 border-t border-gold-500/10 pt-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Vehicle No.</label>
                          <input
                            type="text"
                            placeholder="e.g. UP14AB1234"
                            value={transportVehicleNo}
                            onChange={(e) => setTransportDetails({ vehicleNo: e.target.value })}
                            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">LR / Bilty No.</label>
                          <input
                            type="text"
                            placeholder="e.g. 1176"
                            value={transportLrNo}
                            onChange={(e) => setTransportDetails({ lrNo: e.target.value })}
                            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Transport Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Sharma Transport"
                            value={transportName}
                            onChange={(e) => setTransportDetails({ name: e.target.value })}
                            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Destination</label>
                          <input
                            type="text"
                            placeholder="e.g. Saharanpur"
                            value={transportDestination}
                            onChange={(e) => setTransportDetails({ destination: e.target.value })}
                            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Freight Terms</label>
                        <div className="flex gap-2">
                          {["To Pay", "Paid", "To Be Billed"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setTransportDetails({ freightTerms: opt })}
                              className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition-all ${
                                transportFreightTerms === opt
                                  ? "bg-gold-500 text-obsidian-950 border-gold-500"
                                  : "bg-obsidian-900 text-slate-400 border-gold-500/20 hover:text-slate-200"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* E-Invoice & E-Way Bill (Optional) */}
                <div className="rounded-xl border border-gold-500/15 bg-obsidian-900/40 overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-gold-400 hover:text-gold-300 transition-colors"
                    onClick={() => setShowEInvoice((v) => !v)}
                  >
                    <span className="flex items-center gap-2">
                      📋 E-Invoice / E-Way Bill
                      <span className="text-slate-500 font-normal">(Optional)</span>
                    </span>
                    <span className="text-slate-400">{showEInvoice ? "▲" : "▼"}</span>
                  </button>
                  {showEInvoice && (
                    <div className="px-3.5 pb-3.5 space-y-2 border-t border-gold-500/10 pt-2.5">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Acknowledgement No. (IRN Ack No.)</label>
                        <input
                          type="text"
                          placeholder="e.g. 132628652604656"
                          value={eInvoiceAckNo}
                          onChange={(e) => setEInvoiceDetails({ ackNo: e.target.value })}
                          className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">E-Way Bill No.</label>
                          <input
                            type="text"
                            placeholder="e.g. 312325864287"
                            value={eWayBillNo}
                            onChange={(e) => setEInvoiceDetails({ wayBillNo: e.target.value })}
                            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Valid Till</label>
                          <input
                            type="date"
                            value={eWayBillValidTill}
                            onChange={(e) => setEInvoiceDetails({ validTill: e.target.value })}
                            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bank Account Details (Optional) */}
                <div className="rounded-xl border border-gold-500/15 bg-obsidian-900/40 overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-gold-400 hover:text-gold-300 transition-colors"
                    onClick={() => setShowBank((v) => !v)}
                  >
                    <span className="flex items-center gap-2">
                      🏦 Bank Account Details
                      <span className="text-slate-500 font-normal">(Optional)</span>
                    </span>
                    <span className="text-slate-400">{showBank ? "▲" : "▼"}</span>
                  </button>
                  {showBank && (
                    <div className="px-3.5 pb-3.5 space-y-2 border-t border-gold-500/10 pt-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Account Holder Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Rajdhani Home Decor"
                            value={bankAccountName}
                            onChange={(e) => setBankDetails({ accountName: e.target.value })}
                            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Bank Name</label>
                          <input
                            type="text"
                            placeholder="e.g. HDFC Bank"
                            value={bankName}
                            onChange={(e) => setBankDetails({ bankName: e.target.value })}
                            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Account No.</label>
                          <input
                            type="text"
                            placeholder="e.g. 50200054099981"
                            value={bankAccountNo}
                            onChange={(e) => setBankDetails({ accountNo: e.target.value })}
                            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">IFSC Code</label>
                          <input
                            type="text"
                            placeholder="e.g. HDFC0001393"
                            value={bankIfscCode}
                            onChange={(e) => setBankDetails({ ifscCode: e.target.value })}
                            className="w-full bg-obsidian-900 border border-gold-500/20 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <BillSummary calculation={calculation} />

                <Button
                  variant="gold"
                  size="lg"
                  onClick={handleCheckout}
                  className="w-full font-extrabold uppercase tracking-wider py-3.5 sm:py-4 shadow-gold text-xs sm:text-sm"
                >
                  {paymentMethod === "CREDIT"
                    ? `Complete Sale (Due: ${formatCurrency(calculation.dueAmount)})`
                    : `Complete Sale & Generate Bill (${formatCurrency(calculation.grandTotal)})`}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Floating Quick Checkout Bar on Mobile when browsing Catalog */}
      {cart.length > 0 && mobileTab === "catalog" && (
        <div className="lg:hidden fixed bottom-16 left-3 right-3 z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            onClick={() => setMobileTab("cart")}
            className="w-full bg-gradient-to-r from-gold-500 via-amber-500 to-gold-400 text-obsidian-950 font-black py-3 px-4 rounded-xl shadow-2xl flex items-center justify-between border-2 border-gold-300 active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-obsidian-950/20 font-bold text-xs">
                {totalCartQty} Items
              </span>
              <span className="text-sm font-black">{formatCurrency(calculation.grandTotal)}</span>
            </div>
            <span className="text-xs font-black flex items-center gap-1">
              View Bill & Pay <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      )}

      {/* 4. Generated Bill Popup Modal (Responsive on Both Mobile & PC) */}
      {generatedBill && (
        <Modal
          isOpen={!!generatedBill}
          onClose={() => setGeneratedBill(null)}
          title={`Invoice Generated - ${generatedBill.invoiceNo}`}
          maxWidth="4xl"
        >
          <div className="space-y-3">
            {/* WhatsApp JPG Image Alert Banner */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/40 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-300 flex items-center gap-2">
                    <span>📸 Bill JPG Photo Tayyar Hai!</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-[10px] text-emerald-200">
                      HD Ready
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {generatedBill.customerPhone
                      ? `Customer ke number (${generatedBill.customerPhone}) par direct WhatsApp bhejne ke liye green button dabayein!`
                      : "WhatsApp par photo bhejne ke liye 'Share JPG' dabayein!"}
                  </p>
                </div>
              </div>

              {/* Action Buttons inside Banner */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                {generatedBill.customerPhone ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyInvoiceImageToClipboard("printable-bill-area");
                      if (ok) setIsJpgCopied(true);
                      await downloadInvoiceAsImage(generatedBill.invoiceNo, generatedBill.customerName, "printable-bill-area");
                      openWhatsAppDirect(generatedBill, settings, generatedBill.customerPhone, false);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 fill-slate-950" /> Send to {generatedBill.customerPhone} (WhatsApp)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => shareInvoiceJpgDirect(generatedBill, settings, "printable-bill-area")}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Share className="w-4 h-4" /> Share JPG to WhatsApp
                  </button>
                )}

                {/* Secondary Option: Share Photo */}
                <button
                  type="button"
                  onClick={() => shareInvoiceJpgDirect(generatedBill, settings, "printable-bill-area")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                  title="Share JPG photo via other apps"
                >
                  <Share className="w-3.5 h-3.5" /> Share Photo
                </button>
              </div>
            </div>

            {/* Toolbar Section */}
            <div className="flex justify-between items-center bg-obsidian-900/60 border border-gold-500/20 p-2 sm:p-2.5 rounded-xl flex-wrap gap-2">
              <div className="text-xs font-bold text-slate-200">
                <span>Invoice #{generatedBill.invoiceNo} — Stock Updated</span>
              </div>
              <BillActionToolbar bill={generatedBill} settings={settings} />
            </div>

            {/* Printable Bill Area - Pinch & Scroll enabled for Mobile */}
            <div className="max-h-[60vh] overflow-y-auto overflow-x-auto rounded-xl border border-slate-200 shadow-inner bg-white">
              <BillTemplateA4 bill={generatedBill} settings={settings} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
