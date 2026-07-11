import type { ScoutRequest, StubResult } from "../agent/types.js";

export async function handleIntelligence(_req: ScoutRequest): Promise<StubResult> {
  return {
    status: "coming-soon",
    service: "intelligence",
    message:
      "Marketplace Intelligence (Service 4) is under development. It will surface trending categories, fastest-growing agents, and pricing trends across the CROO ecosystem.",
  };
}
