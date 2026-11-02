# Model routing in Pi

Pi's current chat model is the root coordinator. Keep the user's selected model and thinking level. Codex's `pstack_*`, `poteto_agent`, and `comment_sicko` TOML profiles are source role descriptions only; Pi does not load or execute them.

## Capability check

Inspect the tools exposed in the active session before delegating. This package contains skills only, not a subagent launcher. Do not invoke a Codex CLI or assume spawn/send/wait tools exist.

If a compatible Pi agent extension is explicitly installed, use its actual interface and available model IDs. Carry over the role's scope, exclusive file/worktree ownership, bounded concurrency, fresh-agent defaults, and acceptance criteria. Select only verified available models. Keep implementation and independent verification in different agents. Never count repeated instances of one model as model diversity.

## No delegation runtime

For ordinary work, perform exploration, implementation, and verification as separate sequential passes in the root session. Label the final review as self-review. Keep file pointers and concise findings instead of duplicating large context.

Arena, interrogate, independent shipping review, and other mandatory independence or model-diversity gates cannot be satisfied by these sequential passes. Report the missing capability and limit the deliverable to analysis or an unshipped candidate. Do not claim those gates passed.

Codex's four-agent cap is not a Pi limit. Without an agent extension there are zero child slots. Do not simulate persistent subagents, scheduled audits, unattended goals, or child liveness.

## Model setup

Use `/skill:setup-pstack` to inspect Pi capabilities. `pi --list-models` lists available model IDs. Model changes require the user's request and use Pi's model selector or Pi settings, never Codex TOML edits.
