"use client";

import React from "react";
import dynamic from "next/dynamic";

const BillGalleryView = dynamic(
  () => import("./BillGalleryView").then((mod) => mod.BillGalleryView),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-12 bg-obsidian-900/60 rounded-2xl border border-gold-500/10" />
        <div className="h-24 bg-obsidian-900/60 rounded-2xl border border-gold-500/10" />
        <div className="h-96 bg-obsidian-900/60 rounded-2xl border border-gold-500/10" />
      </div>
    ),
  }
);

export default function BillGalleryPage() {
  return <BillGalleryView />;
}
