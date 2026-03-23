/**
 * AlertsPanel.tsx — High-risk shipments sorted by priority.
 */
import React from "react";
import { Shipment } from "@/lib/mockData";
import { StatusBadge } from "./StatusBadge";
import { DecisionIcon } from "./DecisionIcon";
import { RiskBar } from "./RiskBar";
import { Bell, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

interface Props {
  shipments: Shipment[];
  onSelect: (s: Shipment) => void;
}

export function AlertsPanel({ shipments, onSelect }: Props) {
  const alerts = shipments
    .filter(s => s.risk_score >= 0.35)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.risk_score - a.risk_score);

  return (
    <div className="card-raised overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[hsl(var(--border))] flex items-center gap-2">
        <Bell size={15} className="text-[hsl(var(--status-critical))]" />
        <h2 className="font-semibold text-sm">Active Alerts</h2>
        {alerts.length > 0 && (
          <span className="ml-auto bg-[hsl(var(--status-critical))] text-white text-[10px] font-bold
            px-1.5 py-0.5 rounded-full pulse-critical">
            {alerts.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[hsl(var(--border)/0.5)]">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-[hsl(var(--muted-foreground))] text-sm">
            All shipments nominal
          </div>
        ) : (
          alerts.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={cn(
                "w-full text-left p-3 hover:bg-[hsl(var(--secondary))] transition-colors",
                "flex items-center gap-3 fade-up"
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-semibold text-xs text-[hsl(var(--primary))]">{s.id}</span>
                  <StatusBadge value={s.priority as any} />
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                  {s.origin} → {s.destination}
                </p>
                <RiskBar value={s.risk_score} />
                <div className="flex items-center gap-1 text-[11px]">
                  <DecisionIcon decision={s.decision} size={11} />
                  <span className="text-[hsl(var(--foreground)/0.7)]">{s.decision}</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[hsl(var(--muted-foreground))] flex-shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
