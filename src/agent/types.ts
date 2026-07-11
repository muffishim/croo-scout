import { z } from "zod";

export const ScoutRequestSchema = z.object({
  service: z.enum([
    "agent-lookup",
    "best-finder",
    "comparison",
    "intelligence",
    "benchmark",
    "audit",
  ]),
  agentId: z.string().optional(),
  agentName: z.string().optional(),
  query: z.string().optional(),
  agents: z.array(z.string()).optional(),
  category: z.string().optional(),
});

export type ScoutRequest = z.infer<typeof ScoutRequestSchema>;

export interface ScoutScore {
  overall: number;
  grade: string;
  reliability: number;
  benchmarkPerformance: number;
  costEfficiency: number;
  popularity: number;
  availability: number;
}

export interface AgentLookupResult {
  agentId: string;
  name: string;
  services: ServiceSummary[];
  scoutScore: ScoutScore;
  priceRange: { min: number; max: number };
  summary: string;
}

export interface ServiceSummary {
  serviceId: string;
  name: string;
  price: number;
  description: string;
}

export interface Recommendation {
  rank: number;
  agentId: string;
  name: string;
  scoutScore: ScoutScore;
  matchedService: ServiceSummary;
  confidence: number;
}

export interface BestFinderResult {
  query: string;
  recommendations: Recommendation[];
}

export interface ErrorResult {
  error: string;
  code: string;
}

export interface StubResult {
  status: "coming-soon";
  service: string;
  message: string;
}
