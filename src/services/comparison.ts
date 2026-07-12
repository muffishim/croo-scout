import type { ScoutRequest, StubResult } from "../agent/types.js";

export async function handleComparison(_req: ScoutRequest): Promise<StubResult> {
  return { status: "coming-soon", service: "comparison", message: "Agent Comparison is under development." };
}
