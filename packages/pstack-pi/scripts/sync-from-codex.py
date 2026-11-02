#!/usr/bin/env python3
"""Build the local Pi skill adapter without modifying the Codex installation."""
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path.home() / '.codex/plugins/cache/personal/pstack-codex'
if len(sys.argv) > 1:
    source = Path(sys.argv[1]).expanduser().resolve()
else:
    candidates = list(CACHE.glob('*/.codex-plugin/plugin.json'))
    if not candidates:
        raise SystemExit('No installed pstack-codex plugin found')
    source = max(candidates, key=lambda p: p.stat().st_mtime_ns).parents[1]
manifest = json.loads((source / '.codex-plugin/plugin.json').read_text())
skill_files = sorted((source / 'skills').glob('*/SKILL.md'))
if len(skill_files) != 48:
    raise SystemExit(f'Expected the reviewed 48-skill source; found {len(skill_files)}. Review before syncing.')

stage = ROOT / 'skills.staging'
if stage.exists():
    raise SystemExit(f'Remove or inspect the existing staging directory first: {stage}')
shutil.copytree(source / 'skills', stage)
header = '''## Pi runtime adapter

This is a Pi adaptation of a Codex workflow. These runtime rules take precedence over Codex-specific mechanics below.

- Resolve bundled references and scripts relative to this skill directory. The package root is two directories above this SKILL.md.
- Invoke bundled skills with `/skill:<name>`, or read the sibling skill's SKILL.md when this explicitly invoked workflow routes to it. Do not apply pstack automatically outside an explicit invocation.
- Pi does not ship Codex's spawn/send/wait/close-agent tools, custom-agent TOML runtime, task APIs, plan tool, goals, or scheduled automations. Use only tools actually exposed in this session. Never invent a tool or silently launch Codex as a substitute.
- Read `../poteto-mode/references/model-routing.md` before delegation. Without a compatible agent extension, perform ordinary exploration, implementation, and verification sequentially in the current session. Keep bounded roles and acceptance criteria, but label self-review as self-review. Independent or multi-model review remains an unfulfilled gate; report the gap rather than claiming arena/interrogate coverage or shipping through it.
- Keep multi-step plans in a local Markdown file or the conversation when no plan tool exists. Do not claim persistent monitoring, scheduled runs, goal creation, or work after this turn without an actual supported runtime.
- Use Pi history under `~/.pi/agent/sessions` for Pi recall and handoff. Search Codex history or memory only when the user explicitly asks to import Codex context. Do not edit `~/.codex/agents` from a Pi setup workflow.
- Codex built-in/plugin labels below are provenance, not integrations available in Pi. Use the bundled sibling skill if present. If a referenced external skill or connector is absent, report it and retain the acceptance criteria. Browser tasks use an available browser skill/tool; do not assume browser or terminal-control APIs exist.
- The user's current provider, model, and thinking level remain unchanged. Available tools, user instructions, and the host safety rules govern external actions and destructive operations.

'''
for path in stage.rglob('*.md'):
    original = path.read_text()
    content = re.sub(r'\$pstack-codex:([a-z0-9-]+)', r'/skill:\1', original)
    if path.name == 'SKILL.md':
        match = re.match(r'\A---\n(.*?)\n---\n', content, re.S)
        if not match:
            raise SystemExit(f'Missing frontmatter: {path}')
        front = match.group(1)
        front = re.sub(r'^disable-model-invocation:.*\n?', '', front, flags=re.M)
        content = '---\n' + front + '\ndisable-model-invocation: true\n---\n\n' + header + content[match.end():].lstrip('\n')
    path.write_text(content)

(stage / 'setup-pstack/SKILL.md').write_text('''---
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
''')
(stage / 'poteto-mode/references/model-routing.md').write_text('''# Model routing in Pi

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
''')

if (ROOT / 'skills').exists():
    shutil.rmtree(ROOT / 'skills')
stage.rename(ROOT / 'skills')
shutil.copy2(source / 'LICENSE', ROOT / 'LICENSE')
(ROOT / 'package.json').write_text(json.dumps({
    'name': 'pstack-pi-local',
    'version': '0.15.6-pi.1',
    'private': True,
    'description': 'Local skill-only Pi adapter of the installed pstack-codex plugin',
    'license': 'MIT',
    'pi': {'skills': ['./skills'], 'extensions': [], 'prompts': [], 'themes': []},
}, indent=2) + '\n')
(ROOT / 'source-lock.json').write_text(json.dumps({
    'source': str(source),
    'version': manifest['version'],
    'skillCount': len(skill_files),
    'sourceSkillSha256': {str(p.relative_to(source)): hashlib.sha256(p.read_bytes()).hexdigest() for p in skill_files},
    'runtime': 'Pi skill-only adapter; no Codex subagent execution',
}, indent=2) + '\n')
print(f'Adapted {len(skill_files)} skills from {manifest["version"]} into {ROOT}')
