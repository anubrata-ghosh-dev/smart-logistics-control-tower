/**
 * MetricCard.tsx — KPI stat card used in the top summary row.
 */
import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "ok" | "warn" | "critical" | "default";
  icon?: React.ReactNode;
}

const ACCENT_CLS: Record<string, string> = {
  ok:       "text-[hsl(var(--status-ok))]",
  warn:     "text-[hsl(var(--status-warn))]",
  critical: "text-[hsl(var(--status-critical))]",
  default:  "text-[hsl(var(--primary))]",
};

export function MetricCard({ label, value, sub, accent = "default", icon }: Props) {
  return (
    <div className="card-raised p-4 flex flex-col gap-1 fade-up">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-widest">{label}</span>
        {icon && <span className="opacity-60">{icon}</span>}
      </div>
      <span className={cn("text-3xl font-bold tabular-nums leading-none mt-1", ACCENT_CLS[accent])}>
        {value}
      </span>
      {sub && <span className="text-xs text-[hsl(var(--muted-foreground))]">{sub}</span>}
    </div>
  );
}
