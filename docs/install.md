# Install & Update Codex-Cli-Captain 0.0.3

Use this guide for the Rust-only `0.0.3` release bundle.

## Quick Install & Update

```bash
curl -fsSL https://raw.githubusercontent.com/HoRi0506/Codex-Cli-Captain-Release/main/install.sh | bash
```

The installer script:

- detects the local OS and architecture
- downloads the matching release asset
- installs the bundle under `~/.local/share/ccc/releases/<version-platform>`
- points `~/.local/share/ccc/current` at that bundle
- links `ccc` into `~/.local/bin`
- runs `ccc setup`
- runs `ccc check-install`

For updates, run the same install command again. The installer downloads the selected release asset, updates `~/.local/share/ccc/current` and the linked `ccc` binary, then refreshes setup and check-install.

The installer's own `check-install` run is only an immediate self-check. For the real post-install verification path, fully exit Codex CLI, start a new Codex CLI session, and then run:

```bash
ccc check-install
```

## Reapply Config Changes

After editing `~/.config/ccc/ccc-config.toml`, paste this into Codex CLI:

```text
Run:
ccc setup

Then fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

`setup` reads the config, refreshes MCP registration, installs the packaged `$cap` skill, and syncs CCC-managed custom agents. Restarting Codex CLI makes the refreshed skill and custom-agent definitions available to the host session.

## Active Requests

If a new `$cap` request arrives while an earlier run or subagent is still active, CCC surfaces the active run and recommends merge, replan, or reclaim handling.

Because host custom subagents cannot always be forcibly canceled by CCC, captain should treat stale work as reclaimed or merged and continue from the combined latest request.

Host Codex as captain owns LongWay, routing, lifecycle, fan-in, review, validation, and commit boundaries. Ordinary read-only investigation, docs edits, code/config mutation, and review judgment should go to `ccc_scout`, `ccc_scribe`, `ccc_raider`, and `ccc_arbiter` via custom subagents when available; direct captain work stays limited to explicit fallback, trivial operator-side fixes, or recorded CCC degradation.

## Parallel Lanes

- scout lanes default to 2 read-only lanes when broad or parallel investigation is useful, with a max of 4
- raider lanes default to 2 lanes for broad or multi-file mutation, with a max of 4
- single-file or shared-scope mutation stays sequential

## Installer Variables

- `CCC_VERSION`: release tag to install, defaults to `v0.0.3`
- `CCC_INSTALL_ROOT`: install root, defaults to `~/.local/share/ccc`
- `CCC_BIN_DIR`: directory for the `ccc` symlink, defaults to `~/.local/bin`
- `CCC_DOWNLOAD_URL`: explicit asset URL override, useful for local testing

## What Setup Does

- registers or refreshes the MCP entrypoint
- creates `~/.config/ccc/ccc-config.toml` on first install using the canonical shared-config format
- reuses the existing `~/.config/ccc/ccc-config.toml` when it is already present
- migrates or reads the previous `~/.config/foreman/ccc-config.toml` fallback when present
- backfills missing `companion_agents` / `tool_routing` defaults (including `gh` routing) in existing `ccc-config.toml` files without overwriting user-set values
- migrates legacy `~/.config/foreman/foreman-config.toml` when present
- migrates legacy `~/.config/foreman/foreman-config.json` when present
- installs or refreshes the packaged `$cap` skill
- syncs CCC-managed Codex custom agents under `CODEX_HOME/agents`

The generated shared TOML config includes default per-role `model`, reasoning tier (`variant`), `fast_mode`, companion-agent settings, and git/gh-oriented companion routing.

## Recommended Role Defaults

| CCC role | Agent | Recommended model | Reasoning | Notes |
| --- | --- | --- | --- | --- |
| `orchestrator` | `captain` | `gpt-5.5` | `high` | LongWay ownership and final routing judgment |
| `way` | `tactician` | `gpt-5.5` | `medium` | Planning and bounded next-move selection |
| `explorer` | `scout` | `gpt-5.4-mini` | `medium` | Read-only repo evidence |
| `code specialist` | `raider` | `gpt-5.5` | `high` | Code/config mutation and repair |
| `documenter` | `scribe` | `gpt-5.4-mini` | `medium` | README, release notes, and operator text |
| `verifier` | `arbiter` | `gpt-5.5` | `medium` | Review, risk, regression, and acceptance checks |
| `companion_reader` | `companion_reader` | `gpt-5.4-mini` | `medium` | Low-cost filesystem/docs/web/git/gh read work |
| `companion_operator` | `companion_operator` | `gpt-5.4-mini` | `medium` | Low-cost bounded git/gh mutation and narrow tool work |

`gpt-5.5` is recommended for the high-value roles when Codex is signed in with ChatGPT. If it is unavailable in the current account or execution path, use `gpt-5.4` for those roles until rollout reaches that path.

## Status And Tokens

Prefer `--text`, `--quiet`, and `--json-file` for lower-noise repeated lifecycle calls. `ccc status --text` and quiet lifecycle lines (`ccc status --quiet`, `ccc start --quiet`, `ccc orchestrate --quiet`, `ccc subagent-update --quiet`) always include a token gauge. Raw delegated-worker usage events produce totals and a stacked gauge; unavailable host-side custom subagent usage produces a placeholder gauge plus a clear unavailable reason instead of invented numbers.

## Check-Install Contract

`ccc check-install` is the stable install-health surface.

Expected top block:

```text
CCC install check: status=ok version=0.0.3 entry=$cap registration=matching_registration config=present skill=matching_install
```

Base install expectation:

- `status=ok` when the Rust MCP registration, config file, and `$cap` skill all match the local binary
- `status=warning` when one of those surfaces is missing or mismatched
- custom-agent sync health is also reported in the detailed payload and summary lines
