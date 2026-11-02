# Personal Pi agent configuration

Local configuration for Pi 1.5.0. This repository lives at `~/.pi/agent` and is separate from application repositories.

## Tracked files

- `settings.json`: default model, reasoning, tools, UI preferences, and skill/package paths.
- `models.example.json`: OpenCodex endpoint and model definitions, with the API key replaced by `$OPENCODEX_API_KEY`.
- `extensions/`: OpenAI model filtering, OpenCodex context limits, and response speed display.
- `packages/pstack-pi/`: installed local skill adapter, including its license and source lock.
- `shell/pi.zsh`: shell wrapper that withholds `HF_TOKEN` from Pi while preserving it for other tools.

OpenAI chat models shown: `gpt-6-astra`, `gpt-6-luna`, GPT versions newer than 6.0, and Daybreak. Legacy GPT/o-series models and unversioned aliases are hidden. Other providers are unchanged.

## Restore

1. Install Pi separately. Its managed installer and executable are not versioned here.
2. Place these files in `~/.pi/agent`, preserving any existing credentials and sessions.
3. Create `models.json` from `models.example.json` and supply `OPENCODEX_API_KEY` securely in the launching environment, or put a local literal key in the ignored `models.json`. The loopback OpenCodex service must already be configured.
4. Add this line to `~/.zshrc`:

   ```zsh
   [[ ! -f "$HOME/.pi/agent/shell/pi.zsh" ]] || source "$HOME/.pi/agent/shell/pi.zsh"
   ```

5. Authenticate other providers with `/login`. Adjust external skill paths under `~/.codex/skills` if needed; those skills are not bundled here.
6. Restart Pi or run `/reload` after configuration changes.

`opencodex-auto-limits.ts` currently reads literal keys only for its metadata request. When restoring with `$OPENCODEX_API_KEY`, that request does not send an Authorization header. If the loopback service requires authentication for `/models`, use the ignored local `models.json` with a literal key, matching the original setup.

## Excluded data

The root allowlist excludes `auth.json`, the live `models.json`, model catalogs, caches, sessions, backups, trust state, and managed installation files. Never force-add them. The template is not loaded by Pi.

No remote is configured automatically. Review the endpoint, local paths, device ID in settings, and packaged skills before publishing this repository.
