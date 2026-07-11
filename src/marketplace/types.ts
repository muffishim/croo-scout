export interface MarketplaceAgent {
  agentId: string;
  name: string;
  description: string;
  category: string;
  ownerAddress: string;
  createdAt: string;
}

export interface MarketplaceService {
  serviceId: string;
  agentId: string;
  agentName: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  sla: { hours: number; minutes: number };
  deliverableType: "Text" | "Schema";
  requirementsType: "Text" | "Schema" | "None";
  category: string;
  tags: string[];
}

export interface MarketplaceOrder {
  orderId: string;
  serviceId: string;
  agentId: string;
  requesterId: string;
  status: "completed" | "rejected" | "expired" | "pending" | "paid";
  createdAt: string;
  completedAt?: string;
  price: number;
}

export interface AgentFilters {
  category?: string;
  maxPrice?: number;
}
