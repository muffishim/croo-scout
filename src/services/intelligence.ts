import type { ScoutRequest, StubResult } from "../agent/types.js";

export async function handleIntelligence(_req: ScoutRequest): Promise<StubResult> {
  return { status: "coming-soon", service: "intelligence", message: "Marketplace Intelligence is under development." };
}
