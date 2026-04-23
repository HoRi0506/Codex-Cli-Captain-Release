# Install Codex-Cli-Captain 0.0.3

Use this guide for the Rust-only `0.0.3` release bundle.

## Quick Install

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

The installer's own `check-install` run is only an immediate self-check. For the real post-install verification path, fully exit Codex CLI, start a new Codex CLI session, and then run:

```bash
ccc check-install
```

## Reapply Config Changes

After editing `~/.config/foreman/ccc-config.toml`, paste this into Codex CLI:

```text
Run:
ccc setup

Then fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

`setup` reads the config, refreshes MCP registration, installs the packaged `$cap` skill, and syncs CCC-managed custom agents. Restarting Codex CLI makes the refreshed skill and custom-agent definitions available to the host session.

## Installer Variables

- `CCC_VERSION`: release tag to install, defaults to `v0.0.3`
- `CCC_INSTALL_ROOT`: install root, defaults to `~/.local/share/ccc`
- `CCC_BIN_DIR`: directory for the `ccc` symlink, defaults to `~/.local/bin`
- `CCC_DOWNLOAD_URL`: explicit asset URL override, useful for local testing

## Healthy Check

`ccc check-install` should report:

```text
CCC install check: status=ok version=0.0.3 entry=$cap registration=matching_registration config=present skill=matching_install
```

## Recommended Role Defaults

| CCC role | Agent | Recommended model | Reasoning | Notes |
| --- | --- | --- | --- | --- |
| `orchestrator` | `captain` | `gpt-5.4` | `high` | LongWay ownership and final routing judgment |
| `way` | `tactician` | `gpt-5.4` | `medium` | Planning and bounded next-move selection |
| `explorer` | `scout` | `gpt-5.4-mini` | `medium` | Read-only repo evidence |
| `code specialist` | `raider` | `gpt-5.3-codex` | `high` | Code/config mutation and repair |
| `documenter` | `scribe` | `gpt-5.4-mini` | `medium` | README, release notes, and operator text |
| `verifier` | `arbiter` | `gpt-5.4` | `medium` | Review, risk, regression, and acceptance checks |
| `companion_reader` | `companion_reader` | `gpt-5.4-mini` | `medium` | Low-cost filesystem/docs/web/git/gh read work |
| `companion_operator` | `companion_operator` | `gpt-5.4-mini` | `medium` | Low-cost bounded git/gh mutation and narrow tool work |

## What Setup Does

- registers or refreshes the `ccc` MCP entry in Codex CLI
- creates `~/.config/foreman/ccc-config.toml` on first install using the canonical shared-config format
- reuses the existing `~/.config/foreman/ccc-config.toml` when it is already present
- backfills missing `companion_agents` / `tool_routing` defaults, including `gh` routing, without overwriting user-set values
- installs or refreshes the public `$cap` skill under `CODEX_HOME`
- syncs CCC-managed Codex custom agents under `CODEX_HOME/agents`

The generated shared TOML config includes per-role model settings, companion-agent settings, and git/gh-oriented companion routing. Quiet lifecycle lines include compact token fields such as `tokens=3.1k` or explicit unavailable reason codes when host usage data is not exposed.

## Use

After restarting Codex CLI:

```text
$cap inspect this repository and report findings only
$cap implement the scoped fix, run tests, then commit and push
```
