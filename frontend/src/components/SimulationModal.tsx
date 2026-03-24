/**
 * SimulationModal.tsx — What-if route simulation dialog.
 */
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SimulationResult, Shipment, simulateRoute } from "@/lib/mockData";
import { Route, Clock, IndianRupee, DollarSign, ArrowRight } from "lucide-react";

interface Props {
  shipment: Shipment | null;
  onClose: () => void;
}

export function SimulationModal({ shipment, onClose }: Props) {
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  if (!shipment) return null;
  const sim: SimulationResult = simulateRoute(shipment);

  const inrToUsd = (inr: number) => Math.round(inr / 83);
  const displayCost = currency === "INR" ? sim.cost_increase_INR : inrToUsd(sim.cost_increase_INR);
  const CurrencyIcon = currency === "INR" ? IndianRupee : DollarSign;
  const currencySymbol = currency === "INR" ? "₹" : "$";

  return (
    <Dialog open={!!shipment} onOpenChange={() => onClose()}>
      <DialogContent className="bg-[hsl(var(--surface-raised))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[hsl(var(--primary))]">
            <Route size={18} />
            What-If Route Simulation — {shipment.id}
          </DialogTitle>
        </DialogHeader>

        {/* Route comparison */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--surface))] border border-[hsl(var(--border))]">
          <div className="flex-1 text-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Current Route</p>
            <p className="font-semibold text-sm">{sim.current_route}</p>
          </div>
          <ArrowRight size={18} className="text-[hsl(var(--muted-foreground))] flex-shrink-0" />
          <div className="flex-1 text-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Alternate Route</p>
            <p className="font-semibold text-sm text-[hsl(var(--primary))]">{sim.alternate_route}</p>
          </div>
        </div>

        {/* Trade-off stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-surface p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--status-ok)/0.15)] flex items-center justify-center">
              <Clock size={16} className="text-[hsl(var(--status-ok))]" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Delay Reduction</p>
              <p className="font-bold text-[hsl(var(--status-ok))]">−{sim.delay_reduction_hours}h</p>
            </div>
          </div>
          <div className="card-surface p-3 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg bg-[hsl(var(--status-warn)/0.15)] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setCurrency(prev => prev === "INR" ? "USD" : "INR")}
              title="Click to toggle currency"
            >
              <CurrencyIcon size={16} className="text-[hsl(var(--status-warn))]" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                Extra Cost
                <span
                  className="text-[10px] bg-[hsl(var(--muted))] px-1 rounded cursor-pointer hover:bg-[hsl(var(--muted-foreground)/0.2)] transition-colors"
                  onClick={() => setCurrency(prev => prev === "INR" ? "USD" : "INR")}
                >
                  {currency}
                </span>
              </p>
              <p className="font-bold text-[hsl(var(--status-warn))]">+{currencySymbol}{displayCost.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="p-3 rounded-lg border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.07)]">
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1 uppercase tracking-wide">AI Recommendation</p>
          <p className="text-sm leading-relaxed">
            {sim.recommendation.replace(/~₹[\d,]+/, `~${currencySymbol}${displayCost.toLocaleString()}`)}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
