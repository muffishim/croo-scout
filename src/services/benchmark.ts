import type { ScoutRequest, StubResult } from "../agent/types.js";

export async function handleBenchmark(_req: ScoutRequest): Promise<StubResult> {
  return { status: "coming-soon", service: "benchmark", message: "Agent Benchmark is under development." };
}
