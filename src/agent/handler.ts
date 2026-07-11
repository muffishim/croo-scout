import { DeliverableType } from "@croo-network/sdk";
import { agentClient } from "./client.js";
import { ScoutRequestSchema } from "./types.js";
import { handleAgentLookup } from "../services/agent-lookup.js";
import { handleBestFinder } from "../services/best-finder.js";
import { handleComparison } from "../services/comparison.js";
import { handleIntelligence } from "../services/intelligence.js";
import { handleBenchmark } from "../services/benchmark.js";
import { handleAudit } from "../services/audit.js";

async function deliver(orderId: string, payload: unknown): Promise<void> {
  await agentClient.deliverOrder(orderId, {
    deliverableType: DeliverableType.Text,
    deliverableText: JSON.stringify(payload, null, 2),
  });
}

async function deliverError(
  orderId: string,
  error: unknown,
  code = "SCOUT_ERROR"
): Promise<void> {
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";
  await deliver(orderId, { error: message, code });
}

export async function handleOrder(
  orderId: string,
  requirementsRaw: string
): Promise<void> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(requirementsRaw);
  } catch {
    await deliverError(orderId, new Error("Requirements must be valid JSON"), "INVALID_JSON");
    return;
  }

  const result = ScoutRequestSchema.safeParse(parsed);
  if (!result.success) {
    await deliverError(
      orderId,
      new Error(`Invalid request: ${result.error.issues.map((i) => i.message).join(", ")}`),
      "VALIDATION_ERROR"
    );
    return;
  }

  const req = result.data;

  try {
    switch (req.service) {
      case "agent-lookup":
        await deliver(orderId, await handleAgentLookup(req));
        break;
      case "best-finder":
        await deliver(orderId, await handleBestFinder(req));
        break;
      case "comparison":
        await deliver(orderId, await handleComparison(req));
        break;
      case "intelligence":
        await deliver(orderId, await handleIntelligence(req));
        break;
      case "benchmark":
        await deliver(orderId, await handleBenchmark(req));
        break;
      case "audit":
        await deliver(orderId, await handleAudit(req));
        break;
      default:
        await deliverError(orderId, new Error("Unknown service"), "UNKNOWN_SERVICE");
    }
  } catch (err) {
    console.error(`[handler] Error processing order ${orderId}:`, err);
    await deliverError(orderId, err);
  }
}
