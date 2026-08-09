"use client";

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BillingForm } from "@/components/billing/BillingForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Palette } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-6 h-full">
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
