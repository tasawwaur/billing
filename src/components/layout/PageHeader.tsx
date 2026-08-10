import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gold-500/15">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 gold-gradient-text tracking-wide uppercase">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5" suppressHydrationWarning>{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
};
