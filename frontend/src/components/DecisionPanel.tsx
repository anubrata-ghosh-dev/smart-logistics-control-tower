/**
 * DecisionPanel.tsx — Right-side panel showing full decision breakdown for a selected shipment.
 */
import React, { useState, useEffect } from "react";
import { Shipment, addIncidentNote } from "@/lib/mockData";
import { StatusBadge } from "./StatusBadge";
import { RiskBar } from "./RiskBar";
import { DecisionIcon } from "./DecisionIcon";
import { X, Route, LifeBuoy } from "lucide-react";
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
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    if (shipment) setNoteText(shipment.incident_note || "");
  }, [shipment?.id]);

  const handleSaveNote = () => {
    if (shipment) addIncidentNote(shipment.id, noteText);
  };

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

            {/* Nearest Help */}
            <div className="card-surface p-3 border border-[hsl(var(--status-warn)/0.3)] bg-[hsl(var(--status-warn)/0.03)]">
              <p className="text-[10px] uppercase font-bold text-[hsl(var(--status-warn))] tracking-wide mb-1">Nearest Rescue Hub</p>
              <div className="flex items-center gap-2">
                <LifeBuoy size={16} className="text-[hsl(var(--status-warn))]" />
                <span className="font-semibold text-[13px]">{shipment.nearest_help}</span>
              </div>
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

            {/* Incident Notes */}
            <div className="card-surface p-3 mt-4 space-y-2 border-t border-[hsl(var(--border)/0.5)] pt-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Realtime Incident Log</p>
              <textarea
                className="w-full h-20 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-md p-2 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] resize-none"
                placeholder="Log event details..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button
                onClick={handleSaveNote}
                className="w-full py-1.5 rounded-md bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] text-xs font-semibold hover:bg-[hsl(var(--primary)/0.25)] transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
