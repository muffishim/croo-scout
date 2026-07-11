import { AgentClient, type Config } from "@croo-network/sdk";
import { config } from "../config.js";

const clientConfig: Config = {
  baseURL: config.CROO_API_URL,
  wsURL: config.CROO_WS_URL,
  logger: console,
};

export const agentClient = new AgentClient(clientConfig, config.CROO_SDK_KEY);
