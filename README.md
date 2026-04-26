# Codex-Cli-Captain-Release

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.ko.md">한국어</a> ·
  <a href="./README.ja.md">日本語</a>
</p>

<p align="center">
  <img src="./docs/assets/ccc-banner.png" alt="CCC Codex-Cli-Captain banner" width="100%">
</p>

Current public release: `0.0.5-pre`.

> Pre-release notice: `0.0.5-pre` is still a pre-release. The published pre-release asset is currently `darwin-arm64`; Linux, Windows, and other platform assets are not published for this pre-release yet.

Codex CLI is already smart. Want to use that intelligence with a little more structure? New higher-budget plans are here, and your work deserves a captain that spends that budget on a reasonable path, not random wandering. Welcome to CCC: add `$cap` to your request, and Codex-Cli-Captain will guide the work through a captain-led process before returning the result.

## Install & Update

Copy this into Codex CLI on macOS or Linux:

```text
Install Codex-Cli-Captain from https://github.com/HoRi0506/Codex-Cli-Captain-Release by running:
curl -fsSL https://raw.githubusercontent.com/HoRi0506/Codex-Cli-Captain-Release/main/install.sh | bash

After installation finishes, fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

On Windows PowerShell:

```text
Install Codex-Cli-Captain from https://github.com/HoRi0506/Codex-Cli-Captain-Release by running:
iwr -UseB https://raw.githubusercontent.com/HoRi0506/Codex-Cli-Captain-Release/main/install.ps1 | iex

After installation finishes, fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

For updates, run the same install command again. It downloads the current release asset, updates the current install pointer or Windows install directory plus `ccc` command shim, refreshes setup, and reruns `ccc check-install`; fully restart Codex CLI afterward so the refreshed `$cap` skill and custom agents are loaded.

## Reapply Config Changes

After editing `~/.config/ccc/ccc-config.toml`, paste this into Codex CLI.  Fresh installs generate `~/.config/ccc/ccc-config.toml` with every `gpt-5.4-mini` mini role set to reasoning `variant = "high"` and `fast_mode = true`, and `ccc setup` preserves any existing user-customized values while backfilling missing generated defaults or upgrading stale CCC-generated defaults.

Generated defaults keep the captain reasoning at medium by default while making handoffs cheaper: configured mini/specialist roles stay on the faster service path, copied task details are shortened before they are sent to delegated workers, and the refreshed `$cap` skill plus custom-agent instructions stay compact while the active-specialist drift guardrail keeps stale output from silently overriding the captain's chosen path.

```text
Run:
ccc setup

Then fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

## Recommended Role Defaults

For regular CCC use, ChatGPT Pro $100 is the recommended starting plan because `$cap` workflows can spend more Codex usage through repeated captain and specialist handoffs. Adjust reasoning by your working style and task risk: keep higher reasoning for broad planning, risky code changes, or reviews, and lower it for narrow, repetitive, or low-risk tasks.

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

## Release Note

- [`docs/release/notes/v0.0.5.md`](./docs/release/notes/v0.0.5.md): pre-release card body

## 0.0.5 Pre-Release Planning

The source repo is preparing `0.0.5-pre` around the captain-constrained MCP control plane, no-mutation preflight, and reducing `$cap` toward bootstrap guidance. Keep this release repo on `0.0.5-pre` until that pre-release runtime, docs, and validation are ready to publish.

The pre-release card body lives at `docs/release/notes/v0.0.5.md`. The public release tree keeps `share/skills/cap/SKILL.md` as a thin placeholder; `scripts/build-release-asset.sh` swaps in the authoritative skill from the source repo when it builds an installable asset, so browsing the release repo no longer exposes the full installable skill text.

The release-repo history rewrite decision remains deferred until an explicit release-operator call.
