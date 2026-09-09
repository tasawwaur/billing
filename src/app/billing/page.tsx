"use client";

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Palette } from "lucide-react";
import dynamic from "next/dynamic";

const BillingForm = dynamic(
  () => import("@/components/billing/BillingForm").then((mod) => mod.BillingForm),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-gold-500/30 border-t-gold-500 animate-spin" />
          <span>Billing Terminal Loading...</span>
        </div>
      </div>
    ),
  }
);

export default function BillingPage() {
  return (
    <div className="space-y-4 h-full">
      <PageHeader
        title="💳 Point of Sale & Billing Terminal"
        subtitle="Catalog Search, Barcode Reader, GST Calculator & Instant Thermal Invoice Generator"
        action={
          <Link href="/bill-design">
            <Button variant="outline" size="sm" icon={<Palette className="w-4 h-4" />}>
              Bill Studio
            </Button>
          </Link>
        }
      />
      <BillingForm />
    </div>
  );
}
