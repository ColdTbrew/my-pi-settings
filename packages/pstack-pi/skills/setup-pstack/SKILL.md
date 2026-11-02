---
name: setup-pstack
description: Inspect Pi pstack skill installation, runtime capabilities, and model selection. Use explicitly for setup-pstack or configuring pstack in Pi.
disable-model-invocation: true
---

# Set up pstack for Pi

1. Inspect `~/.pi/agent/settings.json`, run `pi list`, and list available models with `pi --list-models`. Never print credentials or invent model IDs.
2. Read `../poteto-mode/references/model-routing.md`. Explain which delegation tools are actually present. Codex TOML profiles are not executable Pi profiles.
3. Keep the current model and thinking level unless the user requests a change. For a requested persistent change, update only the relevant Pi settings. For a session-only change, use the host's model selector.
4. Without a compatible subagent extension, use the sequential fallback for ordinary work and disclose missing independent review. Installing such an extension is a separate task, not part of this skill-only adapter.
5. Run `/reload` after skill changes. To refresh from the installed Codex plugin, run `python3 <package-root>/scripts/sync-from-codex.py`, validate discovery, then `/reload`. Review a new source release before refreshing.

Never edit Codex's installation or `~/.codex/agents` for Pi configuration.
