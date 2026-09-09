"use client";
import React from "react";
import dynamic from "next/dynamic";

const CustomersView = dynamic(
  () => import("./CustomersView").then((m) => ({ default: m.CustomersView })),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-obsidian-900/60 rounded-2xl" /> }
);

export default function CustomersPage() {
  return <CustomersView />;
}
