import { builtinProviders } from "@earendil-works/pi-ai/providers/all";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Keep Astra/Luna, newer numbered GPT generations, and Daybreak.
function keepChatModel(id: string): boolean {
  if (id === "gpt-6-astra" || id === "gpt-6-luna" || id.startsWith("gpt-daybreak-")) return true;
  const version = /^gpt-(\d+)(?:\.(\d+))?(?:-|$)/.exec(id);
  if (!version) return false;
  const major = Number(version[1]);
  const minor = Number(version[2] ?? 0);
  return major > 6 || (major === 6 && minor > 0);
}

export default function (pi: ExtensionAPI) {
  const provider = builtinProviders().find((entry) => entry.id === "openai")!;
  pi.registerProvider({
    ...provider,
    filterModels(models, credential) {
      const available = provider.filterModels?.(models, credential) ?? models;
      return available.filter((model) => keepChatModel(model.id));
    },
    filterAllModels(models, credential) {
      const available = provider.filterAllModels?.(models, credential) ?? models;
      return available.filter(
        (model) => (model.type !== undefined && model.type !== "chat") || keepChatModel(model.id),
      );
    },
  });
}
