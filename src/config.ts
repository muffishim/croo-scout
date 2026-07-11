import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  CROO_API_URL: z.string().url().default("https://api.croo.network"),
  CROO_WS_URL: z.string().default("wss://api.croo.network/ws"),
  CROO_SDK_KEY: z.string().min(1, "CROO_SDK_KEY is required"),
  SERVICE_ID_AGENT_LOOKUP: z.string().optional(),
  SERVICE_ID_BEST_FINDER: z.string().optional(),
  SERVICE_ID_COMPARISON: z.string().optional(),
  SERVICE_ID_INTELLIGENCE: z.string().optional(),
  SERVICE_ID_BENCHMARK: z.string().optional(),
  SERVICE_ID_AUDIT: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;

export const serviceIds: Record<string, string | undefined> = {
  "agent-lookup": config.SERVICE_ID_AGENT_LOOKUP,
  "best-finder": config.SERVICE_ID_BEST_FINDER,
  comparison: config.SERVICE_ID_COMPARISON,
  intelligence: config.SERVICE_ID_INTELLIGENCE,
  benchmark: config.SERVICE_ID_BENCHMARK,
  audit: config.SERVICE_ID_AUDIT,
};
