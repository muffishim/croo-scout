import { searchServices } from "../../marketplace/api.js";
import { computeScoutScore } from "../reputation/engine.js";
import type { MarketplaceService } from "../../marketplace/types.js";
import type { Recommendation, ScoutScore, ServiceSummary } from "../../agent/types.js";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function keywordScore(service: MarketplaceService, queryTokens: string[]): number {
  const haystack = tokenize(
    `${service.name} ${service.description} ${(service.tags ?? []).join(" ")}`
  );
  const matches = queryTokens.filter((t) => haystack.includes(t)).length;
  return queryTokens.length > 0 ? matches / queryTokens.length : 0;
}

function toServiceSummary(s: MarketplaceService): ServiceSummary {
  return {
    serviceId: s.serviceId,
    name: s.name,
    price: s.price,
    description: s.description,
  };
}

export async function findBestAgents(
  query: string,
  topN = 5
): Promise<Recommendation[]> {
  const services = await searchServices(query);
  if (services.length === 0) return [];

  // Deduplicate: keep cheapest service per agent
  const byAgent = new Map<string, MarketplaceService>();
  for (const s of services) {
    const existing = byAgent.get(s.agentId);
    if (!existing || s.price < existing.price) {
      byAgent.set(s.agentId, s);
    }
  }

  const queryTokens = tokenize(query);

  const candidates = await Promise.all(
    Array.from(byAgent.entries()).map(async ([agentId, service]) => {
      const scoutScore = await computeScoutScore(agentId).catch(
        (): ScoutScore => ({
          overall: 50,
          grade: "C",
          reliability: 50,
          benchmarkPerformance: 50,
          costEfficiency: 50,
          popularity: 50,
          availability: 50,
        })
      );
      const kw = keywordScore(service, queryTokens);
      // Confidence blends keyword relevance (40%) and Scout score (60%)
      const confidence = Math.round((kw * 0.4 + (scoutScore.overall / 100) * 0.6) * 100) / 100;
      return { agentId, service, scoutScore, confidence };
    })
  );

  return candidates
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, topN)
    .map((c, i) => ({
      rank: i + 1,
      agentId: c.agentId,
      name: c.service.agentName,
      scoutScore: c.scoutScore,
      matchedService: toServiceSummary(c.service),
      confidence: c.confidence,
    }));
}
