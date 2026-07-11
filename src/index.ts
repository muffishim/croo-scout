import { EventType } from "@croo-network/sdk";
import { agentClient } from "./agent/client.js";
import { handleOrder } from "./agent/handler.js";

// Cache: orderId → requirements string (populated on negotiation accept)
const requirementsCache = new Map<string, string>();

const HANDLED_EVENTS = new Set<string>([
  EventType.NegotiationCreated,
  EventType.OrderPaid,
]);

async function main(): Promise<void> {
  console.log("[scout] CROO Scout starting...");

  const stream = await agentClient.connectWebSocket();
  console.log("[scout] Connected to CROO WebSocket. Listening for orders.");

  stream.on(EventType.NegotiationCreated, async (e) => {
    const negotiationId = e.negotiation_id!;
    console.log(`[scout] Negotiation received: ${negotiationId}`);
    try {
      const result = await agentClient.acceptNegotiation(negotiationId);
      // Cache requirements so OrderPaid handler can access them without an extra API call
      requirementsCache.set(
        result.order.orderId,
        result.negotiation.requirements ?? "{}"
      );
      console.log(`[scout] Negotiation accepted → order ${result.order.orderId}`);
    } catch (err) {
      console.error(`[scout] Failed to accept negotiation ${negotiationId}:`, err);
    }
  });

  stream.on(EventType.OrderPaid, async (e) => {
    const orderId = e.order_id!;
    console.log(`[scout] Order paid: ${orderId} — processing...`);

    try {
      // Prefer cached requirements; fall back to fetching the negotiation
      let requirements = requirementsCache.get(orderId);
      if (!requirements) {
        const order = await agentClient.getOrder(orderId);
        const negotiation = await agentClient.getNegotiation(order.negotiationId);
        requirements = negotiation.requirements ?? "{}";
      }
      requirementsCache.delete(orderId);

      await handleOrder(orderId, requirements);
      console.log(`[scout] Order ${orderId} delivered.`);
    } catch (err) {
      console.error(`[scout] Failed to process order ${orderId}:`, err);
    }
  });

  stream.onAny((e) => {
    if (!HANDLED_EVENTS.has(e.type)) {
      console.log(`[scout] Event: ${e.type}`);
    }
  });

  const shutdown = () => {
    console.log("\n[scout] Shutting down...");
    stream.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[scout] Fatal error:", err);
  process.exit(1);
});
