import React from "react";
import { BillDetailClient } from "./BillDetailClient";

export async function generateStaticParams() {
  return [
    { billId: "demo" },
    { billId: "bill-310" },
    { billId: "INV-2026-00310" },
  ];
}

export default function BillDetailPage() {
  return <BillDetailClient />;
}
