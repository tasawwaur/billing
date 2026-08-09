"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useBillingStore } from "@/store/billing-store";
import { useSettingsStore } from "@/store/settings-store";
import { PageHeader } from "@/components/layout/PageHeader";
import { BillTemplateA4 } from "@/components/bills/BillTemplateA4";
import { Button } from "@/components/ui/Button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BillDetailPage() {
  const params = useParams();
  const billId = params.billId as string;
  const { bills } = useBillingStore();
  const { settings } = useSettingsStore();

  const bill = bills.find((b) => b.id === billId || b.invoiceNo === billId);

  if (!bill) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-rose-400">Invoice Not Found</h2>
        <p className="text-xs text-slate-400">The requested invoice ({billId}) does not exist in store record.</p>
        <Link href="/dashboard">
          <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Tax Invoice - ${bill.invoiceNo}`}
        subtitle={`Customer: ${bill.customerName} | Status: ${bill.paymentStatus}`}
        action={
          <div className="flex gap-2">
            <Link href="/billing">
              <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                Back to POS
              </Button>
            </Link>
            <Button variant="gold" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
              Print / Save PDF
            </Button>
          </div>
        }
      />

      <div className="p-4 bg-obsidian-950/80 rounded-2xl border border-gold-500/20 max-w-4xl mx-auto shadow-2xl">
        <BillTemplateA4 bill={bill} settings={settings} />
      </div>
    </div>
  );
}
