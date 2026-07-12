import { getAgent, getAgentServices, listAgents } from "../marketplace/api.js";
import { computeScoutScore } from "../modules/reputation/engine.js";
import type { AgentLookupResult, ScoutRequest } from "../agent/types.js";

export async function handleAgentLookup(req: ScoutRequest): Promise<AgentLookupResult> {
  let agentId = req.agentId;

  if (!agentId && req.agentName) {
    const all = await listAgents();
    const match = all.find((a) => a.name.toLowerCase() === req.agentName!.toLowerCase());
    if (!match) throw new Error(`No agent found with name "${req.agentName}"`);
    agentId = match.agentId;
  }

  if (!agentId) throw new Error("Either agentId or agentName must be provided");

  const [agent, services, scoutScore] = await Promise.all([
    getAgent(agentId),
    getAgentServices(agentId),
    computeScoutScore(agentId),
  ]);

  const prices = services.map((s) => s.price).filter((p) => p > 0);
  const priceRange = prices.length > 0
    ? { min: Math.min(...prices), max: Math.max(...prices) }
    : { min: 0, max: 0 };

  return {
    agentId,
    name: agent.name,
    services: services.map((s) => ({ serviceId: s.serviceId, name: s.name, price: s.price, description: s.description })),
    scoutScore,
    priceRange,
    summary: `${agent.name} has a Scout Score of ${scoutScore.overall}/100 (${scoutScore.grade}), offering ${services.length} service${services.length !== 1 ? "s" : ""} on the CROO marketplace.`,
  };
}
