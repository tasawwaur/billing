"use client";
import React from "react";
import dynamic from "next/dynamic";

const PaymentsView = dynamic(
  () => import("./PaymentsView").then((m) => ({ default: m.PaymentsView })),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-obsidian-900/60 rounded-2xl" /> }
);

export default function PaymentsPage() {
  return <PaymentsView />;
}
