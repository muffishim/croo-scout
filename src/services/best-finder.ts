import { findBestAgents } from "../modules/discovery/engine.js";
import type { BestFinderResult, ScoutRequest } from "../agent/types.js";

export async function handleBestFinder(
  req: ScoutRequest
): Promise<BestFinderResult> {
  const query = req.query?.trim();
  if (!query) {
    throw new Error("A query describing the desired capability is required");
  }

  const recommendations = await findBestAgents(query, 5);

  return {
    query,
    recommendations,
  };
}
