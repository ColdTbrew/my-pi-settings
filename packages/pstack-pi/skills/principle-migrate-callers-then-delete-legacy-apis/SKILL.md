---
name: principle-migrate-callers-then-delete-legacy-apis
description: "Apply when introducing a new internal API while old callers still exist. Migrate callers and delete the old API in the same wave instead of preserving compatibility layers."
disable-model-invocation: true
---

## Pi runtime adapter

This is a Pi adaptation of a Codex workflow. These runtime rules take precedence over Codex-specific mechanics below.

- Resolve bundled references and scripts relative to this skill directory. The package root is two directories above this SKILL.md.
- Invoke bundled skills with `/skill:<name>`, or read the sibling skill's SKILL.md when this explicitly invoked workflow routes to it. Do not apply pstack automatically outside an explicit invocation.
- Pi does not ship Codex's spawn/send/wait/close-agent tools, custom-agent TOML runtime, task APIs, plan tool, goals, or scheduled automations. Use only tools actually exposed in this session. Never invent a tool or silently launch Codex as a substitute.
- Read `../poteto-mode/references/model-routing.md` before delegation. Without a compatible agent extension, perform ordinary exploration, implementation, and verification sequentially in the current session. Keep bounded roles and acceptance criteria, but label self-review as self-review. Independent or multi-model review remains an unfulfilled gate; report the gap rather than claiming arena/interrogate coverage or shipping through it.
- Keep multi-step plans in a local Markdown file or the conversation when no plan tool exists. Do not claim persistent monitoring, scheduled runs, goal creation, or work after this turn without an actual supported runtime.
- Use Pi history under `~/.pi/agent/sessions` for Pi recall and handoff. Search Codex history or memory only when the user explicitly asks to import Codex context. Do not edit `~/.codex/agents` from a Pi setup workflow.
- Codex built-in/plugin labels below are provenance, not integrations available in Pi. Use the bundled sibling skill if present. If a referenced external skill or connector is absent, report it and retain the acceptance criteria. Browser tasks use an available browser skill/tool; do not assume browser or terminal-control APIs exist.
- The user's current provider, model, and thinking level remain unchanged. Available tools, user instructions, and the host safety rules govern external actions and destructive operations.

# Migrate Callers Then Delete Legacy APIs

When we decide a new API is the right design, migrate callers and remove the old API in the same refactor wave instead of preserving compatibility layers.

**Rule:**
- Do not keep legacy API paths only because internal callers still exist
- Inventory callers, migrate them, and delete the old API immediately
- Treat temporary adapters as exceptional and time-boxed, not default architecture
- Update tests to assert the new contract, and delete tests that only protect pre-refactor implementation details

**When this applies:**
- No external users depend on backward compatibility
- The project can absorb coordinated breaking changes
- The new API is part of a simplification or refactor initiative

Keeping both old and new APIs creates dual-path complexity, slows cleanup, and makes the codebase feel append-only.
