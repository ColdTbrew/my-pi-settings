---
name: principle-explain-the-number
description: "Apply before you trust, report, or act on a number you measured: a speedup, a regression, a throughput, a latency, or an eval result. Find what limits it, and rule out that it measured something other than the work you think."
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

# Explain the Number

A measured number is a claim about a system. Before you trust it, report it, or act on it, find what limits it and rule out that it measured something else.

**Why:** A run that went wrong still prints a plausible number. Requests that failed, a cache that skipped the work, code that never ran, a side left on default settings, and run-to-run noise all produce results that look fine. If you cannot say why the number is not twice as good, you do not know what you measured.

**Pattern:**

- **Ask "why not double?"** Name the resource or code path that bounds the result, such as a core, a lock, the disk, the network, or the load generator itself. Get it from a profile or from system counters taken during a run, then map it to source. A guess from reading the code is not a limiter.
- **List what else the number could be measuring, and rule out each one with evidence.** The usual suspects are errors, skipped or cached work, an untuned side, noise, and a piece too small to matter end to end.
- **Keep the evidence with the number.** Put the run count, the spread, and the limiter in the notes or a linked artifact, so a reader can check the claim.

For a performance number, run the full procedure with the [benchmark-checklist](../benchmark-checklist/SKILL.md) skill. For an eval result, ask the same of the trials: did every run do the task, does the gap hold across trials and models, and does the scenario matter.

You skipped this when the evidence behind a number has no run count, no spread, or no named limiter, or when the time saved is larger than the time the changed piece took.

Distinct from [Prove It Works](../principle-prove-it-works/SKILL.md), which checks that an output is real. This checks that a measured number means what you say it means.
