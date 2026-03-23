/**
 * DecisionPanel.tsx — Right-side panel showing full decision breakdown for a selected shipment.
 */
import React from "react";
import { Shipment } from "@/lib/mockData";
import { StatusBadge } from "./StatusBadge";
import { RiskBar } from "./RiskBar";
import { DecisionIcon } from "./DecisionIcon";
import { X, Route } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  shipment: Shipment | null;
  onClose: () => void;
  onSimulate: (s: Shipment) => void;
}

const CONF_COLOR = (c: number) =>
  c >= 0.85 ? "text-[hsl(var(--status-ok))]" :
  c >= 0.65 ? "text-[hsl(var(--status-warn))]" :
              "text-[hsl(var(--status-critical))]";

export function DecisionPanel({ shipment, onClose, onSimulate }: Props) {
  return (
    <div className={cn(
      "fixed top-0 right-0 h-full w-80 z-40 flex flex-col",
      "bg-[hsl(var(--surface-raised))] border-l border-[hsl(var(--border))]",
      "transition-transform duration-300 ease-out",
      shipment ? "translate-x-0" : "translate-x-full"
    )}>
      {shipment && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Decision Card</p>
              <h2 className="font-bold text-lg">{shipment.id}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[hsl(var(--secondary))] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Route */}
            <div className="card-surface p-3">
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Route</p>
              <p className="font-semibold text-sm">{shipment.origin} → {shipment.destination}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{shipment.cargo_type}</p>
            </div>

            {/* Decision */}
            <div className="card-surface p-3">
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">AI Decision</p>
              <div className="flex items-center gap-2">
                <DecisionIcon decision={shipment.decision} size={18} />
                <span className="font-bold">{shipment.decision}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              <StatusBadge value={shipment.priority as any} />
              <StatusBadge value={shipment.status as any} />
            </div>

            {/* Risk breakdown */}
            <div className="card-surface p-3 space-y-2">
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Risk Score</p>
              <RiskBar value={shipment.risk_score} />
            </div>

            {/* Confidence */}
            <div className="card-surface p-3">
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Prediction Confidence</p>
              <span className={cn("text-2xl font-bold tabular-nums", CONF_COLOR(shipment.confidence))}>
                {Math.round(shipment.confidence * 100)}%
              </span>
            </div>

            {/* Explanation */}
            <div className="card-surface p-3 space-y-2">
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wide">Why This Decision?</p>
              {shipment.explanation.map((line, i) => (
                <p key={i} className="text-xs leading-relaxed text-[hsl(var(--foreground)/0.85)]">{line}</p>
              ))}
            </div>

            {/* Simulate button */}
            <button
              onClick={() => onSimulate(shipment)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg
                bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]
                text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Route size={15} />
              Run What-If Simulation
            </button>
          </div>
        </>
      )}
    </div>
  );
}
