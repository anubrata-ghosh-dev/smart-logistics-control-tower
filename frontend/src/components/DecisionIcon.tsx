/**
 * DecisionIcon.tsx — Icon + colour for each decision type.
 */
import React from "react";
import { AlertTriangle, Clock, Eye, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

const CONFIG: Record<string, { icon: React.ElementType; cls: string }> = {
  "Reroute immediately": { icon: Navigation,     cls: "text-[hsl(var(--status-critical))]" },
  "Delay shipment":      { icon: Clock,          cls: "text-[hsl(var(--status-warn))]"     },
  "Monitor closely":     { icon: Eye,            cls: "text-[hsl(var(--status-monitor))]"  },
};

interface Props { decision: string; size?: number; className?: string; }

export function DecisionIcon({ decision, size = 14, className }: Props) {
  const cfg = CONFIG[decision] ?? { icon: AlertTriangle, cls: "text-[hsl(var(--muted-foreground))]" };
  const Icon = cfg.icon;
  return <Icon size={size} className={cn(cfg.cls, className)} />;
}
