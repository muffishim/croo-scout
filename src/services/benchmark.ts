import type { ScoutRequest, StubResult } from "../agent/types.js";

export async function handleBenchmark(_req: ScoutRequest): Promise<StubResult> {
  return {
    status: "coming-soon",
    service: "benchmark",
    message:
      "Agent Benchmark (Service 5) is under development. It will place live test orders against the target agent and score accuracy, speed, cost efficiency, and consistency.",
  };
}
