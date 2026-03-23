/**
 * StatusBadge.tsx — Pill badge for shipment status and priority.
 */
import React from "react";
import { cn } from "@/lib/utils";

type Variant = "high" | "medium" | "low" | "on-time" | "at-risk" | "delayed" | "monitor";

const MAP: Record<Variant, string> = {
  "high":     "badge-high",
  "medium":   "badge-medium",
  "low":      "badge-low",
  "on-time":  "badge-low",
  "at-risk":  "badge-medium",
  "delayed":  "badge-high",
  "monitor":  "badge-monitor",
};

interface Props { value: Variant; className?: string; }

export function StatusBadge({ value, className }: Props) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide",
      MAP[value] ?? "badge-low",
      className
    )}>
      {value}
    </span>
  );
}
