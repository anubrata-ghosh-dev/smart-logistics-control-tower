/**
 * RiskBar.tsx — Animated horizontal risk bar with color coding.
 */
import React from "react";
import { cn } from "@/lib/utils";

interface Props { value: number; className?: string; }

export function RiskBar({ value, className }: Props) {
  const pct = Math.round(value * 100);
  const color = value >= 0.65
    ? "bg-[hsl(var(--status-critical))]"
    : value >= 0.35
    ? "bg-[hsl(var(--status-warn))]"
    : "bg-[hsl(var(--status-ok))]";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--border))]">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="tabular-nums text-xs text-[hsl(var(--muted-foreground))] w-8 text-right">{pct}%</span>
    </div>
  );
}
