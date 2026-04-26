# Install & Update Codex-Cli-Captain 0.0.5-pre

Use this guide for the Rust-only `0.0.5-pre` release bundle.

> Pre-release notice: `0.0.5-pre` is still a pre-release. The published pre-release asset is currently `darwin-arm64`; Linux, Windows, and other platform assets are not published for this pre-release yet.

## Quick Install & Update

macOS and Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/HoRi0506/Codex-Cli-Captain-Release/main/install.sh | bash
```

Windows PowerShell:

```powershell
iwr -UseB https://raw.githubusercontent.com/HoRi0506/Codex-Cli-Captain-Release/main/install.ps1 | iex
```

The installer script:

- detects the local OS and architecture
- downloads the matching release asset
- installs the bundle under `~/.local/share/ccc/releases/<version-platform>` on macOS/Linux or `%LOCALAPPDATA%\ccc\releases\<version-platform>` on Windows
- points the current install at that bundle
- links or shims `ccc` into `~/.local/bin` on macOS/Linux or `%USERPROFILE%\.local\bin\ccc.cmd` on Windows
- runs `ccc setup`
- runs `ccc check-install`

Supported release asset platforms are:

- `darwin-arm64`
- `darwin-x86_64`
- `linux-arm64`
- `linux-x86_64`
- `windows-x86_64`
- `windows-arm64`

The Bash installer performs native installs on macOS and Linux. The PowerShell installer performs native installs on Windows and supports `windows-x86_64` and `windows-arm64`.

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

Host Codex as captain owns LongWay, routing, lifecycle, fan-in, review, validation, and commit boundaries. Ordinary read-only investigation, docs edits, code/config mutation, and review judgment should go to `ccc_scout`, `ccc_scribe`, `ccc_raider`, and `ccc_arbiter` via custom subagents when available; direct captain work stays limited to explicit fallback, trivial operator-side fixes, or recorded CCC degradation. Route-backed lightweight filesystem/docs/fetch/git/gh work should use the configured companion owner: git and `gh` reads go to `companion_reader`, and git or `gh` mutations go to `companion_operator` unless the captain records fallback/degradation.

If the host reports file-descriptor pressure such as `Too many open files (os error 24)`, stop opening additional reviewers or specialists. Record terminal lifecycle state for every active host agent, merge or reclaim it through captain, and close the host agent before continuing so file and thread handles are released.

For document/checklist-backed requests where the operator asks CCC to finish or continue work to completion, status surfaces include `completion_discipline`. Treat the referenced source as completion criteria and continue bounded slices until all in-scope items are completed, explicitly deferred, or blocked on a concrete operator decision.

## Parallel Lanes

- scout lanes default to 2 read-only lanes when broad or parallel investigation is useful, with a max of 4
- raider lanes default to 2 lanes for broad or multi-file mutation, with a max of 4
- single-file or shared-scope mutation stays sequential

## Installer Variables

- `CCC_VERSION`: release tag to install, defaults to `v0.0.5-pre`
- `CCC_INSTALL_ROOT`: install root, defaults to `~/.local/share/ccc`
- `CCC_BIN_DIR`: directory for the `ccc` symlink, defaults to `~/.local/bin`
- `CCC_DOWNLOAD_URL`: explicit asset URL override, useful for local testing
- `CCC_PLATFORM`: explicit supported platform override, useful for verification
- `CCC_PRINT_ASSET=1`: print the resolved release asset name and exit before download or install

Release builder asset-name validation uses the same print-only convention:

```bash
CCC_PRINT_ASSET=1 ./scripts/build-release-asset.sh 0.0.5-pre windows-x86_64
CCC_PRINT_ASSET=1 ./scripts/build-release-asset.sh 0.0.5-pre windows-arm64
```

For a local no-download check across installer and builder asset names plus the Windows install smoke, run `./scripts/verify-release-asset-matrix.sh`. The Windows-specific smoke can also be run directly with `./scripts/verify-windows-install-smoke.sh`.

## What Setup Does

- registers or refreshes the MCP entrypoint
- creates `~/.config/ccc/ccc-config.toml` on first install using the canonical shared-config format
- reuses the existing `~/.config/ccc/ccc-config.toml` when it is already present
- backfills missing `companion_agents` / `tool_routing` defaults (including `gh` routing) in existing `ccc-config.toml` files while preserving user-customized values
- installs or refreshes the packaged `$cap` skill
- syncs CCC-managed Codex custom agents under `CODEX_HOME/agents`

The generated shared TOML config includes default per-role `model`, reasoning tier (`variant`), `fast_mode`, companion-agent settings, generated-defaults version metadata, and git/gh-oriented companion routing. Fresh installs set every `gpt-5.4-mini` mini role (`explorer`, `documenter`, `companion_reader`, and `companion_operator`) to reasoning `variant = "high"` and `fast_mode = true`, while `ccc setup` preserves existing user-customized values, backfills missing generated defaults, and upgrades stale generated defaults when they match older CCC-generated values, including the `way`/tactician default from `gpt-5.5` `medium` to `gpt-5.5` `high`.

Captain keeps its configured reasoning quality; token/speed tuning focuses on fast mini/specialist service tiers, delegated worker scope/acceptance/task excerpts capped at 420/280/900 characters, and compact packaged `$cap` plus custom-agent instructions.

## Recommended Role Defaults

For regular CCC use, ChatGPT Pro $100 is the recommended starting plan because `$cap` workflows can spend more Codex usage through repeated captain and specialist handoffs. Adjust reasoning by your working style, task risk, and observed token usage: keep higher reasoning for broad planning, risky code changes, or reviews, and lower it for narrow, repetitive, or low-risk tasks.

| CCC role | Agent | Recommended model | Reasoning | Notes |
| --- | --- | --- | --- | --- |
| `orchestrator` | `captain` | `gpt-5.5` | `medium` | LongWay ownership and final routing judgment |
| `way` | `tactician` | `gpt-5.5` | `high` | Planning and bounded next-move selection |
| `explorer` | `scout` | `gpt-5.4-mini` | `high` | Read-only repo evidence |
| `code specialist` | `raider` | `gpt-5.5` | `high` | Code/config mutation and repair |
| `documenter` | `scribe` | `gpt-5.4-mini` | `high` | README, release notes, and operator text |
| `verifier` | `arbiter` | `gpt-5.5` | `medium` | Review, risk, regression, and acceptance checks |
| `companion_reader` | `companion_reader` | `gpt-5.4-mini` | `high` | Low-cost filesystem/docs/web/git/gh read work |
| `companion_operator` | `companion_operator` | `gpt-5.4-mini` | `high` | Low-cost bounded git/gh mutation and narrow tool work |

`gpt-5.5` is recommended for the high-value roles when Codex is signed in with ChatGPT. If it is unavailable in the current account or execution path, use `gpt-5.4` for those roles until rollout reaches that path.

## Status And Tokens

Prefer `--text`, `--quiet`, and `--json-file` for lower-noise repeated lifecycle calls. `ccc status --text` and quiet lifecycle lines (`ccc status --quiet`, `ccc start --quiet`, `ccc orchestrate --quiet`, `ccc subagent-update --quiet`) always include a token gauge. Raw delegated-worker usage events produce totals and a stacked gauge; unavailable host-side custom subagent usage produces a placeholder gauge plus a clear unavailable reason instead of invented numbers. Structured status/activity payloads also expose `token_usage_visibility.status` and `token_usage_visibility.unavailable_reason_code` for JSON consumers.

## Check-Install Contract

`ccc check-install` is the stable install-health surface.

Expected top block:

```text
CCC install check: status=ok version=0.0.5-pre entry=$cap registration=matching_registration config=canonical-current config_action=preserved config_restart=not-required skill=matching_install
Install surface: status=current restart=not-required mcp=matching_registration skill=matching_install custom_agents=matching_sync
```

Base install expectation:

- `status=ok` when the Rust MCP registration, config file, `$cap` skill, and CCC-managed custom agents all match the local binary
- `status=warning` when one of those surfaces is missing or mismatched
- `installSurfaceVisibility` groups `mcp_registration`, `ccc_config`, `cap_skill`, and `custom_agents` with normalized `status`, `action_status`, `restart_status`, and summary fields
- setup/check-install reports whether those surfaces are current, missing, stale, migrated, conflicting, unreadable, and whether setup plus Codex CLI restart is required
