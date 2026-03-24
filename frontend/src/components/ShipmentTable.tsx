/**
 * ShipmentTable.tsx — Main data grid showing all shipments.
 */
import React from "react";
import { Shipment } from "@/lib/mockData";
import { RiskBar } from "./RiskBar";
import { StatusBadge } from "./StatusBadge";
import { DecisionIcon } from "./DecisionIcon";
import { cn } from "@/lib/utils";
import { MapPin, Zap } from "lucide-react";

interface Props {
  shipments: Shipment[];
  onSelect: (s: Shipment) => void;
  selected: string | null;
}

export function ShipmentTable({ shipments, onSelect, selected }: Props) {
  return (
    <div className="card-raised overflow-hidden">
      <div className="px-4 py-3 border-b border-[hsl(var(--border))] flex items-center gap-2">
        <MapPin size={15} className="text-[hsl(var(--primary))]" />
        <h2 className="font-semibold text-sm">Live Fleet  —  {shipments.length} vessels</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
              {["ID", "Origin → Dest", "Cargo", "Weather", "Dist. (NM)", "Speed", "Risk", "Status", "Priority", "Decision"].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shipments.map((s, i) => (
              <tr
                key={s.id}
                onClick={() => onSelect(s)}
                className={cn(
                  "border-b border-[hsl(var(--border)/0.5)] cursor-pointer transition-colors",
                  "hover:bg-[hsl(var(--secondary))]",
                  selected === s.id && "bg-[hsl(var(--primary)/0.08)] border-l-2 border-l-[hsl(var(--primary))]",
                  i % 2 === 0 ? "" : "bg-[hsl(var(--surface)/0.4)]"
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <td className="px-3 py-3 font-mono font-semibold text-[hsl(var(--primary))] whitespace-nowrap">{s.id}</td>
                <td className="px-3 py-3 whitespace-nowrap text-xs">
                  <span className="text-[hsl(var(--foreground)/0.8)]">{s.origin}</span>
                  <span className="text-[hsl(var(--muted-foreground))] mx-1">→</span>
                  <span className="text-[hsl(var(--foreground)/0.8)]">{s.destination}</span>
                </td>
                <td className="px-3 py-3 text-xs text-[hsl(var(--muted-foreground))] max-w-[120px] truncate">
                  {s.cargo_type}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs">
                  {s.weather}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-xs text-[hsl(var(--muted-foreground))]">
                  {s.distance_to_dest.toLocaleString()} nm
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className={cn(
                    "flex items-center gap-1 font-mono text-xs",
                    s.speed < 5 ? "text-[hsl(var(--status-critical))]" : "text-[hsl(var(--foreground)/0.75)]"
                  )}>
                    {s.speed < 5 && <Zap size={11} />}
                    {s.speed.toFixed(1)}kn
                  </span>
                </td>
                <td className="px-3 py-3 min-w-[100px]">
                  <RiskBar value={s.risk_score} />
                </td>
                <td className="px-3 py-3"><StatusBadge value={s.status as any} /></td>
                <td className="px-3 py-3"><StatusBadge value={s.priority as any} /></td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-xs">
                    <DecisionIcon decision={s.decision} size={13} />
                    <span className="text-[hsl(var(--foreground)/0.8)]">{s.decision}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
