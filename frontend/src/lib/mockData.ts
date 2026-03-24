/**
 * mockData.ts — In-browser simulation of the FastAPI backend.
 *
 * Mirrors the exact logic of the Python backend so the React dashboard
 * works standalone (no server required for the demo).
 *
 * When you run the real FastAPI backend, replace these functions with
 * fetch() calls to http://127.0.0.1:8000/api/v1/...
 */

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  cargo_type: string;
  latitude: number;
  longitude: number;
  speed: number;
  weather: string;
  distance_to_dest: number;
  status: "on-time" | "at-risk" | "delayed";
  risk_score: number;
  priority: "high" | "medium" | "low";
  decision: string;
  confidence: number;
  explanation: string[];
  incident_note?: string;
  nearest_help: string;
}

export interface SimulationResult {
  shipment_id: string;
  current_route: string;
  alternate_route: string;
  delay_reduction_hours: number;
  cost_increase_INR: number;
  recommendation: string;
}

// ── Seed fleet ──────────────────────────────────────────────────────────────
const SHIPMENT_NOTES: Record<string, string> = {};

export function addIncidentNote(shipmentId: string, note: string) {
  SHIPMENT_NOTES[shipmentId] = note;
}

const BASE_FLEET: Omit<Shipment, "status" | "risk_score" | "decision" | "confidence" | "explanation" | "weather" | "distance_to_dest" | "incident_note" | "nearest_help">[] = [
  { id: "SHP-001", origin: "Dubai", destination: "Rotterdam", cargo_type: "Medical Supplies", latitude: 26.56, longitude: 56.10, speed: 4.2, priority: "high" },
  { id: "SHP-002", origin: "Shanghai", destination: "Los Angeles", cargo_type: "Electronics", latitude: 2.40, longitude: 101.5, speed: 14.0, priority: "low" },
  { id: "SHP-003", origin: "Mumbai", destination: "Hamburg", cargo_type: "Food Grains", latitude: 12.58, longitude: 43.45, speed: 9.5, priority: "medium" },
  { id: "SHP-004", origin: "Singapore", destination: "New York", cargo_type: "Automobile Parts", latitude: -10.0, longitude: 80.0, speed: 17.2, priority: "low" },
  { id: "SHP-005", origin: "Cape Town", destination: "London", cargo_type: "Pharmaceutical", latitude: 30.30, longitude: 32.40, speed: 3.8, priority: "high" },
  { id: "SHP-006", origin: "Houston", destination: "Tokyo", cargo_type: "Fuel / LNG", latitude: 35.80, longitude: -5.70, speed: 12.0, priority: "medium" },
  { id: "SHP-007", origin: "Sydney", destination: "San Francisco", cargo_type: "Machinery", latitude: -33.86, longitude: 151.20, speed: 15.5, priority: "medium" },
  { id: "SHP-008", origin: "Valparaiso", destination: "Yokohama", cargo_type: "Minerals", latitude: -33.04, longitude: -71.62, speed: 11.2, priority: "low" },
];

const CHOKEPOINTS = [
  { name: "Strait of Hormuz", lat: 26.57, lon: 56.25, risk: 0.75 },
  { name: "Suez Canal", lat: 30.45, lon: 32.55, risk: 0.60 },
  { name: "Strait of Malacca", lat: 2.50, lon: 101.4, risk: 0.45 },
  { name: "Bab-el-Mandeb", lat: 12.58, lon: 43.45, risk: 0.70 },
  { name: "Strait of Gibraltar", lat: 35.93, lon: -5.58, risk: 0.20 },
];

const RADIUS = 2.0;
const SPEED_THRESHOLD = 5.0;
const W_SPEED = 0.25, W_WEATHER = 0.35, W_GEO = 0.40;

const DESTINATION_COORDS: Record<string, { lat: number, lon: number }> = {
  "Rotterdam": { lat: 51.92, lon: 4.48 },
  "Los Angeles": { lat: 33.72, lon: -118.26 },
  "Hamburg": { lat: 53.55, lon: 9.99 },
  "New York": { lat: 40.71, lon: -74.01 },
  "London": { lat: 51.51, lon: -0.13 },
  "Tokyo": { lat: 35.68, lon: 139.69 },
  "San Francisco": { lat: 37.77, lon: -122.42 },
  "Yokohama": { lat: 35.44, lon: 139.64 },
};

const MARITIME_HUBS: Record<string, { lat: number, lon: number }> = {
  "UAE (Dubai Rescue)": { lat: 25.20, lon: 55.27 },
  "Singapore (East Asia Rescue)": { lat: 1.35, lon: 103.81 },
  "South Africa (Cape Town Rescue)": { lat: -33.92, lon: 18.42 },
  "USA (USCG Pacific)": { lat: 37.80, lon: -122.40 },
  "USA (USCG Atlantic)": { lat: 40.70, lon: -74.00 },
  "UK (HM Coastguard)": { lat: 50.90, lon: -1.40 },
  "Japan (JCG)": { lat: 35.65, lon: 139.80 },
  "Spain (Salvamento Marítimo)": { lat: 36.14, lon: -5.35 },
  "India (ICG)": { lat: 18.92, lon: 72.82 },
  "Chile (Directemar)": { lat: -33.04, lon: -71.62 },
  "Australia (AMSA)": { lat: -33.86, lon: 151.20 }
};

function getDistanceNM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Radius of earth in nautical miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function rnd(min: number, max: number) { return Math.random() * (max - min) + min; }

function geoRisk(lat: number, lon: number): { risk: number; name: string | null } {
  let max = 0, nearest: string | null = null;
  for (const cp of CHOKEPOINTS) {
    const d = Math.sqrt((lat - cp.lat) ** 2 + (lon - cp.lon) ** 2);
    if (d <= RADIUS) {
      const eff = cp.risk * (1 - (d / RADIUS) * 0.5);
      if (eff > max) { max = eff; nearest = cp.name; }
    }
  }
  return { risk: parseFloat(max.toFixed(2)), name: nearest };
}

function makeDecision(risk: number, priority: string, conf: number): string {
  const hiRisk = risk >= 0.65, medRisk = risk >= 0.35, hiConf = conf >= 0.75;
  if (priority === "high") {
    if (hiRisk) return "Reroute immediately";
    if (medRisk && hiConf) return "Delay shipment";
    return "Monitor closely";
  }
  if (priority === "medium") {
    if (hiRisk && hiConf) return "Reroute immediately";
    if (hiRisk) return "Delay shipment";
    return "Monitor closely";
  }
  return "Monitor closely";
}

export function computeShipments(): Shipment[] {
  return BASE_FLEET.map((s) => {
    // simulate position drift
    const lat = s.latitude + rnd(-0.05, 0.05);
    const lon = s.longitude + rnd(-0.07, 0.07);
    const spd = Math.max(3, Math.min(25, s.speed + rnd(-1.5, 1.5)));

    // speed risk
    let speedRisk = 0.1;
    const expl: string[] = [];
    if (spd < SPEED_THRESHOLD) {
      speedRisk = 0.8;
      expl.push(`⚠️ Speed anomaly: ${spd.toFixed(1)} knots below ${SPEED_THRESHOLD}-knot threshold`);
    } else if (spd < SPEED_THRESHOLD * 1.5) {
      speedRisk = 0.4;
      expl.push(`🔶 Reduced speed: ${spd.toFixed(1)} knots — slightly below optimal`);
    } else {
      expl.push(`✅ Speed normal: ${spd.toFixed(1)} knots`);
    }

    // weather risk (simulated — demo mode)
    const weatherRisk = rnd(0.05, 0.30);
    const weatherDesc = weatherRisk > 0.2 ? "Light rain / overcast" : "Clear skies";
    const weatherStatus = weatherRisk > 0.2 ? `🌧️ ${weatherDesc}` : `☀️ ${weatherDesc}`;
    expl.push(weatherRisk > 0.2 ? `🌧️ Adverse weather: ${weatherDesc}` : `☀️ Weather favourable: ${weatherDesc}`);

    // geopolitical risk
    const geo = geoRisk(lat, lon);
    if (geo.name) {
      expl.push(`🚨 Near ${geo.name} — critical maritime chokepoint (risk ${(geo.risk * 100).toFixed(0)}%)`);
    } else {
      expl.push("🟢 No critical geopolitical chokepoints detected");
    }

    // composite
    const totalRisk = parseFloat(
      Math.min(speedRisk * W_SPEED + weatherRisk * W_WEATHER + geo.risk * W_GEO, 1.0).toFixed(3)
    );
    const status: Shipment["status"] = totalRisk >= 0.65 ? "delayed" : totalRisk >= 0.35 ? "at-risk" : "on-time";
    const confidence = parseFloat(Math.max(0.5, 0.95).toFixed(2));
    const decision = makeDecision(totalRisk, s.priority, confidence);

    const destCoords = DESTINATION_COORDS[s.destination] || { lat: 0, lon: 0 };
    const distance_to_dest = getDistanceNM(lat, lon, destCoords.lat, destCoords.lon);
    const incident_note = SHIPMENT_NOTES[s.id] || "";

    let shortestDist = Infinity;
    let nearest_help = "Unknown Rescue Hub";
    for (const [hub, coords] of Object.entries(MARITIME_HUBS)) {
      const dist = getDistanceNM(lat, lon, coords.lat, coords.lon);
      if (dist < shortestDist) {
        shortestDist = dist;
        nearest_help = hub + ` (${dist.toLocaleString()} nm)`;
      }
    }

    return { ...s, latitude: lat, longitude: lon, speed: spd, weather: weatherStatus, distance_to_dest, status, risk_score: totalRisk, confidence, decision, explanation: expl, incident_note, nearest_help };
  });
}

const ALTERNATE_ROUTES: Record<string, [string, number, number]> = {
  "Dubai→Rotterdam": ["Cape of Good Hope bypass", 36, 180000],
  "Shanghai→Los Angeles": ["Northern Pacific corridor", 18, 95000],
  "Mumbai→Hamburg": ["Suez bypass via Cape Route", 42, 210000],
  "Singapore→New York": ["Trans-Pacific + Panama canal", 24, 130000],
  "Cape Town→London": ["Atlantic coastal route", 10, 45000],
  "Houston→Tokyo": ["Caribbean + Pacific bypass", 28, 115000],
  "Sydney→San Francisco": ["Direct Pacific Route", 14, 85000],
  "Valparaiso→Yokohama": ["Trans-Pacific Southern Route", 22, 110000],
};

export function simulateRoute(s: Shipment): SimulationResult {
  const key = `${s.origin}→${s.destination}`;
  const [route, delay, cost] = ALTERNATE_ROUTES[key] ?? ["Coastal waypoint re-route", 12, 50000];
  const dh = delay + Math.round(rnd(-3, 3));
  const cu = cost + Math.round(rnd(-5000, 5000));
  return {
    shipment_id: s.id,
    current_route: `${s.origin} → ${s.destination}`,
    alternate_route: route,
    delay_reduction_hours: dh,
    cost_increase_INR: cu * 83,
    recommendation: `Switch to "${route}" to avoid risk zone. Delay reduction ~${dh}h. Extra cost ~₹${(cu * 83).toLocaleString()}.`,
  };
}
