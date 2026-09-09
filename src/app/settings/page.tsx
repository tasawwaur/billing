"use client";
import React from "react";
import dynamic from "next/dynamic";

const SettingsView = dynamic(
  () => import("./SettingsView").then((m) => ({ default: m.SettingsView })),
  { ssr: false, loading: () => <div className="animate-pulse h-96 bg-obsidian-900/60 rounded-2xl" /> }
);

export default function SettingsPage() {
  return <SettingsView />;
}
