import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI, ProviderChatModelConfig } from "@earendil-works/pi-coding-agent";

const targets = new Set(["gpt-6.1-sol", "gpt-6.1-sol--fast"]);
// Match the Codex GPT-6.1 Sol default, not opencodex's advertised long-window ceiling.
const codexDefaultContextWindow = 500_000;
const positiveInteger = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) > 0;

type Limits = { contextWindow: number; maxTokens: number };

export default async function (pi: ExtensionAPI) {
  const agentDir = process.env.PI_CODING_AGENT_DIR || join(homedir(), ".pi", "agent");
  const config = JSON.parse(await readFile(join(agentDir, "models.json"), "utf8"));
  const provider = config.providers?.opencodex;
  if (!provider?.baseUrl || !provider.models) return;
  const cachePath = join(agentDir, "cache", "opencodex-auto-limits.json");
  let limits: Record<string, Limits> = {};
  try {
    const cached = JSON.parse(await readFile(cachePath, "utf8"));
    if (cached.baseUrl === provider.baseUrl) {
      for (const id of targets) {
        const entry = cached.limits?.[id];
        if (positiveInteger(entry?.contextWindow) && positiveInteger(entry?.maxTokens)) {
          limits[id] = {
            contextWindow: Math.min(entry.contextWindow, codexDefaultContextWindow),
            maxTokens: entry.maxTokens,
          };
        }
      }
    }
  } catch { /* No last-known limits on the first run. */ }

  const models = (): ProviderChatModelConfig[] => provider.models.map((model: ProviderChatModelConfig) => ({
    ...model,
    cost: model.cost ?? { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: model.contextWindow ?? 128000,
    maxTokens: model.maxTokens ?? 16384,
    ...(targets.has(model.id) ? limits[model.id] : {}),
  }));

  async function refresh(signal?: AbortSignal) {
    const timeout = AbortSignal.timeout(5000);
    const headers: Record<string, string> = {};
    // The existing loopback provider uses a literal key; never execute config commands here.
    if (typeof provider.apiKey === "string" && !/^[!$]/.test(provider.apiKey)) {
      headers.Authorization = `Bearer ${provider.apiKey}`;
    }
    try {
      const response = await fetch(`${provider.baseUrl.replace(/\/+$/, "")}/models`, {
        headers,
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (!Array.isArray(payload.data)) throw new Error("Invalid model catalog");
      const next = { ...limits };
      for (const model of payload.data) {
        if (!targets.has(model.id)) continue;
        const contextWindow = model.context_window ?? model.context_length ?? model.capabilities?.context_length;
        const maxTokens = model.max_output_tokens ?? model.capabilities?.max_output_tokens;
        if (positiveInteger(contextWindow) && positiveInteger(maxTokens)) {
          next[model.id] = {
            contextWindow: Math.min(contextWindow, codexDefaultContextWindow),
            maxTokens,
          };
        }
      }
      for (const id of targets) {
        if (!next[id]) throw new Error(`No limits advertised for ${id}`);
      }
      limits = next;
    } catch (error) {
      if (signal?.aborted) throw error;
      if ([...targets].some((id) => !limits[id])) throw error;
      // Preserve the last-known server limits if the loopback proxy is offline.
      return models();
    }
    try {
      await mkdir(join(agentDir, "cache"), { recursive: true });
      const temporary = `${cachePath}.${process.pid}.tmp`;
      await writeFile(temporary, JSON.stringify({ baseUrl: provider.baseUrl, limits }, null, 2) + "\n", { mode: 0o600 });
      await rename(temporary, cachePath);
    } catch { /* Cache persistence must not prevent using live metadata. */ }
    return models();
  }

  pi.registerProvider("opencodex", {
    baseUrl: provider.baseUrl,
    api: provider.api,
    models: await refresh(),
    refreshModels: ({ signal }) => refresh(signal),
  });
}
