import { getAgentOrders, getAgentServices, listAllServices } from "../../marketplace/api.js";
import type { ScoutScore } from "../../agent/types.js";

const GRADE_THRESHOLDS: [number, string][] = [
  [95, "A+"], [90, "A"], [80, "B"], [70, "C"], [60, "D"], [0, "F"],
];

function toGrade(score: number): string {
  for (const [min, grade] of GRADE_THRESHOLDS) {
    if (score >= min) return grade;
  }
  return "F";
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

async function reliabilityScore(
  orders: Awaited<ReturnType<typeof getAgentOrders>>
): Promise<number> {
  if (orders.length === 0) return 50;
  const completed = orders.filter((o) => o.status === "completed").length;
  return clamp((completed / orders.length) * 100);
}

async function costEfficiencyScore(agentPrice: number): Promise<number> {
  try {
    const all = await listAllServices();
    const prices = all.map((s) => s.price).filter((p) => p > 0);
    if (prices.length === 0) return 50;
    const sorted = [...prices].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const ratio = median / agentPrice;
    return clamp(50 + (ratio - 1) * 25);
  } catch {
    return 50;
  }
}

function popularityScore(orders: Awaited<ReturnType<typeof getAgentOrders>>): number {
  const uniqueRequesters = new Set(orders.map((o) => o.requesterId)).size;
  const byCount = Math.min(100, Math.log10(orders.length + 1) * 40);
  const byUnique = Math.min(100, Math.log10(uniqueRequesters + 1) * 50);
  return clamp((byCount + byUnique) / 2);
}

function availabilityScore(orders: Awaited<ReturnType<typeof getAgentOrders>>): number {
  if (orders.length === 0) return 30;
  const now = Date.now();
  const mostRecent = Math.max(
    ...orders.map((o) => new Date(o.completedAt ?? o.createdAt).getTime())
  );
  const daysSinceActive = (now - mostRecent) / (1000 * 60 * 60 * 24);
  return clamp(100 - daysSinceActive * 1.1);
}

export async function computeScoutScore(agentId: string): Promise<ScoutScore> {
  const [services, orders] = await Promise.all([
    getAgentServices(agentId),
    getAgentOrders(agentId, 200),
  ]);

  const minPrice = services.length ? Math.min(...services.map((s) => s.price)) : 0;

  const [reliability, costEfficiency] = await Promise.all([
    reliabilityScore(orders),
    costEfficiencyScore(minPrice || 0.1),
  ]);

  const popularity = popularityScore(orders);
  const availability = availabilityScore(orders);
  const benchmarkPerformance = 50;

  const overall = clamp(
    reliability * 0.3 +
    benchmarkPerformance * 0.25 +
    costEfficiency * 0.2 +
    popularity * 0.15 +
    availability * 0.1
  );

  return { overall, grade: toGrade(overall), reliability, benchmarkPerformance, costEfficiency, popularity, availability };
}
