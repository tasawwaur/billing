import type { Metadata } from "next";
import "@/styles/globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "LUXURY STORE - Billing & POS System",
  description: "Ultra-premium Billing, POS, Invoice Generator, Customer Ledger & Inventory Management Software",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-obsidian-950 text-slate-100 min-h-screen antialiased flex selection:bg-gold-500 selection:text-obsidian-950">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <Topbar />
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
