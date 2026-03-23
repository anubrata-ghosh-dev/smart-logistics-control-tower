/**
 * Index.tsx — Supply Chain Decision Intelligence Control Tower Dashboard
 */
import React, { useState, useEffect, useCallback } from "react";
import { computeShipments, Shipment } from "@/lib/mockData";
import { MetricCard } from "@/components/MetricCard";
import { ShipmentTable } from "@/components/ShipmentTable";
import { AlertsPanel } from "@/components/AlertsPanel";
import { DecisionPanel } from "@/components/DecisionPanel";
import { SimulationModal } from "@/components/SimulationModal";
import {
  Ship, AlertTriangle, CheckCircle, RefreshCw,
  Activity, Globe, TrendingUp, Wifi
} from "lucide-react";
import { cn } from "@/lib/utils";

const REFRESH_INTERVAL_MS = 8000;

export default function Index() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [simTarget, setSimTarget] = useState<Shipment | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setShipments(computeShipments());
      setLastRefresh(new Date());
      setIsRefreshing(false);
      setTick(t => t + 1);
    }, 300);
  }, []);

  // Initial load + auto-refresh
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  // Keep selected shipment in sync after refresh
  useEffect(() => {
    if (selected) {
      const updated = shipments.find(s => s.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [shipments]);

  // Derived metrics
  const critical   = shipments.filter(s => s.risk_score >= 0.65).length;
  const atRisk     = shipments.filter(s => s.risk_score >= 0.35 && s.risk_score < 0.65).length;
  const onTime     = shipments.filter(s => s.risk_score < 0.35).length;
  const avgConf    = shipments.length ? Math.round(shipments.reduce((a, b) => a + b.confidence, 0) / shipments.length * 100) : 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">

      {/* ── Top nav ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-[hsl(var(--border))] px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center">
            <Globe size={16} className="text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none">Supply Chain Intelligence</h1>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">AI Decision Control Tower</p>
          </div>
        </div>

        {/* live indicator */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">
            <Wifi size={11} className="text-[hsl(var(--status-ok))]" />
            <span>Live  ·  refreshes every {REFRESH_INTERVAL_MS / 1000}s</span>
          </div>
          <button
            onClick={refresh}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold",
              "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--border))] transition-colors",
              isRefreshing && "opacity-60 cursor-not-allowed"
            )}
            disabled={isRefreshing}
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className={cn(
        "transition-all duration-300",
        selected ? "mr-80" : "mr-0"
      )}>
        <div className="p-6 space-y-6">

          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              label="Total Vessels"
              value={shipments.length}
              sub="active in fleet"
              icon={<Ship size={16} className="text-[hsl(var(--primary))]" />}
              accent="default"
            />
            <MetricCard
              label="Critical Risk"
              value={critical}
              sub="reroute / delay"
              icon={<AlertTriangle size={16} className="text-[hsl(var(--status-critical))]" />}
              accent={critical > 0 ? "critical" : "ok"}
            />
            <MetricCard
              label="At Risk"
              value={atRisk}
              sub="monitoring closely"
              icon={<Activity size={16} className="text-[hsl(var(--status-warn))]" />}
              accent={atRisk > 0 ? "warn" : "ok"}
            />
            <MetricCard
              label="On Time"
              value={onTime}
              sub={`${avgConf}% avg confidence`}
              icon={<CheckCircle size={16} className="text-[hsl(var(--status-ok))]" />}
              accent="ok"
            />
          </div>

          {/* Main grid: table + alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
            {/* Shipment table */}
            <div className="fade-up" style={{ animationDelay: "100ms" }}>
              {shipments.length === 0 ? (
                <div className="card-raised p-12 text-center">
                  <div className="skeleton w-full h-6 mb-3 rounded" />
                  <div className="skeleton w-3/4 h-6 mb-3 rounded mx-auto" />
                  <div className="skeleton w-2/3 h-6 rounded mx-auto" />
                </div>
              ) : (
                <ShipmentTable
                  shipments={shipments}
                  onSelect={setSelected}
                  selected={selected?.id ?? null}
                />
              )}
            </div>

            {/* Alerts panel */}
            <div className="fade-up" style={{ animationDelay: "160ms" }}>
              <AlertsPanel shipments={shipments} onSelect={setSelected} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))] pt-2 border-t border-[hsl(var(--border)/0.4)]">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={11} />
              <span>Prediction engine: Speed (25%) + Weather (35%) + Geopolitical (40%)</span>
            </div>
            <span>Last update: {lastRefresh.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* ── Side panel ──────────────────────────────────────────────────────── */}
      <DecisionPanel
        shipment={selected}
        onClose={() => setSelected(null)}
        onSimulate={(s) => { setSimTarget(s); }}
      />

      {/* Backdrop when panel open */}
      {selected && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSelected(null)}
        />
      )}

      {/* ── Simulation modal ─────────────────────────────────────────────── */}
      <SimulationModal
        shipment={simTarget}
        onClose={() => setSimTarget(null)}
      />
    </div>
  );
}
