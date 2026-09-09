"use client";
import React from "react";
import dynamic from "next/dynamic";

const LedgerView = dynamic(
  () => import("./LedgerView").then((m) => ({ default: m.LedgerView })),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-obsidian-900/60 rounded-2xl" /> }
);

export default function LedgerPage() {
  return <LedgerView />;
}
