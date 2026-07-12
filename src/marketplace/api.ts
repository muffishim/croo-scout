import { agentClient } from "../agent/client.js";
import { config } from "../config.js";
import type {
  AgentFilters,
  MarketplaceAgent,
  MarketplaceOrder,
  MarketplaceService,
} from "./types.js";

const BASE = config.CROO_API_URL;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${config.CROO_SDK_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Marketplace API error ${res.status} on ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function listAgents(
  filters: AgentFilters = {}
): Promise<MarketplaceAgent[]> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.maxPrice != null)
    params.set("maxPrice", String(filters.maxPrice));
  const qs = params.toString();
  return get<MarketplaceAgent[]>(`/agents${qs ? `?${qs}` : ""}`);
}

export async function getAgent(agentId: string): Promise<MarketplaceAgent> {
  return get<MarketplaceAgent>(`/agents/${agentId}`);
}

export async function getAgentServices(
  agentId: string
): Promise<MarketplaceService[]> {
  return get<MarketplaceService[]>(`/agents/${agentId}/services`);
}

export async function getAgentOrders(
  agentId: string,
  limit = 100
): Promise<MarketplaceOrder[]> {
  try {
    return get<MarketplaceOrder[]>(
      `/agents/${agentId}/orders?limit=${limit}&status=completed,rejected,expired`
    );
  } catch {
    const orders = await agentClient.listOrders({ pageSize: limit, agentId });
    return orders
      .filter((o) => o.providerAgentId === agentId)
      .map((o) => ({
        orderId: o.orderId,
        serviceId: o.serviceId ?? "",
        agentId: o.providerAgentId ?? agentId,
        requesterId: o.requesterAgentId ?? "",
        status: (o.status ?? "completed") as MarketplaceOrder["status"],
        createdAt: o.createdAt ?? o.createdTime ?? new Date().toISOString(),
        completedAt: o.deliveredAt || undefined,
        price: parseFloat(o.price ?? "0"),
      }));
  }
}

export async function searchServices(
  query: string
): Promise<MarketplaceService[]> {
  const params = new URLSearchParams({ q: query });
  try {
    return get<MarketplaceService[]>(`/services/search?${params}`);
  } catch {
    const all = await get<MarketplaceService[]>("/services");
    const lower = query.toLowerCase();
    return (all as MarketplaceService[]).filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.description.toLowerCase().includes(lower) ||
        s.tags?.some((t) => t.toLowerCase().includes(lower))
    );
  }
}

export async function listAllServices(): Promise<MarketplaceService[]> {
  return get<MarketplaceService[]>("/services");
}
