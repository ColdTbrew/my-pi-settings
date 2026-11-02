---
name: principle-sequence-verifiable-units
description: "Apply to multi-step work (sweeps, migrations, runs of similar edits) and to how you stack commits and PRs. Break work into small units that each end in a verifiable state, check each before the next, and order delivery so the sequence proves itself to a reviewer."
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

# Sequence work into verifiable units

Order work as a sequence of small units, each ending in a state you can check, and don't advance until the current one is green.

**Why:** A break caught at the unit that caused it is cheap to localize. A break caught after a batch is buried, and you have already built further on a broken base. Sequencing those same units into a delivery a reviewer can replay turns "trust me" into "watch it go red, then green."

**Execution.** In a sweep, migration, or any run of similar edits, verify each change before starting the next. Each unit is a before/after bracket: known-good state, one change, run the check, then proceed. Rebase onto clean trunk first so every check measures against the real baseline. When a lever does the edits, the per-unit check is nearly free. Run it anyway.

**Delivery.** Stack commits and PRs in the order that proves the work. The canonical shape is the failing test first, then the fix on top. Other story orders are a subtraction before the reshape, a baseline capture before the treatment, the scaffold before the feature. Each commit lands on its own and the sequence reads as an argument.

The sequencing complement to the **prove-it-works** principle skill, which keeps each check real, and the **build-the-lever** principle skill, which makes the per-unit check cheap.
