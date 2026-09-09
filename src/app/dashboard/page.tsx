"use client";

import React from "react";
import dynamic from "next/dynamic";

const DashboardView = dynamic(
  () => import("@/components/dashboard/DashboardView").then((mod) => mod.DashboardView),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-16 bg-obsidian-900/60 rounded-2xl border border-gold-500/10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-32 bg-obsidian-900/60 rounded-2xl border border-gold-500/10" />
          <div className="h-32 bg-obsidian-900/60 rounded-2xl border border-gold-500/10" />
          <div className="h-32 bg-obsidian-900/60 rounded-2xl border border-gold-500/10" />
          <div className="h-32 bg-obsidian-900/60 rounded-2xl border border-gold-500/10" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-72 bg-obsidian-900/60 rounded-2xl border border-gold-500/10" />
          <div className="lg:col-span-4 h-72 bg-obsidian-900/60 rounded-2xl border border-gold-500/10" />
        </div>
        <div className="h-64 bg-obsidian-900/60 rounded-2xl border border-gold-500/10" />
      </div>
    ),
  }
);

export default function DashboardPage() {
  return <DashboardView />;
}
