# Codex-Cli-Captain-Release

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.ko.md">한국어</a> ·
  <a href="./README.ja.md">日本語</a>
</p>

<p align="center">
  <img src="./docs/assets/ccc-banner.png" alt="CCC Codex-Cli-Captain banner" width="100%">
</p>

Current public release: `0.0.4`.

Codex CLI is already smart. Want to use that intelligence with a little more structure? New higher-budget plans are here, and your work deserves a captain that spends that budget on a reasonable path, not random wandering. Welcome to CCC: add `$cap` to your request, and Codex-Cli-Captain will guide the work through a captain-led process before returning the result.

## Install & Update

Copy this into Codex CLI:

```text
Install Codex-Cli-Captain from https://github.com/HoRi0506/Codex-Cli-Captain-Release by running:
curl -fsSL https://raw.githubusercontent.com/HoRi0506/Codex-Cli-Captain-Release/main/install.sh | bash

After installation finishes, fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

For updates, run the same install command again. It downloads the current release asset, updates the `current` symlink and `ccc` binary, refreshes setup, and reruns `ccc check-install`; fully restart Codex CLI afterward so the refreshed `$cap` skill and custom agents are loaded.

## Reapply Config Changes

After editing `~/.config/ccc/ccc-config.toml`, paste this into Codex CLI. Existing `~/.config/foreman/ccc-config.toml` installs are read as a fallback and migrated by `ccc setup`. Fresh installs generate `~/.config/ccc/ccc-config.toml` with the `gpt-5.4-mini` mini roles set to `variant = "high"` and `fast_mode = true`, and `ccc setup` preserves any existing user-customized values while backfilling only missing generated defaults.

```text
Run:
ccc setup

Then fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

## Active Runs And Parallel Work

When a new `$cap` request arrives while an earlier run or subagent is still active, CCC now surfaces that active run and recommends merge, replan, or reclaim handling. Host custom subagents cannot always be forcibly canceled by CCC, so the captain records stale work honestly and continues from the combined latest request.

If Codex reports file-descriptor pressure such as `Too many open files (os error 24)`, pause new reviewer or specialist launches. Keep the work single-path until each active host agent has a terminal lifecycle update, is merged or reclaimed by captain, and is closed in the host session so thread/file handles are released.

- scout lanes default to 2 read-only lanes for broad investigation, max 4
- raider lanes default to 2 lanes for broad or multi-file mutation, max 4
- single-file or shared-scope mutation stays sequential

Token gauges are always visible in `--text` and quiet lifecycle output. When raw usage events are available, CCC prints totals and a stacked gauge; when host custom subagents do not expose usage events, CCC prints a placeholder gauge with an explicit unavailable reason instead of guessing. Structured status/activity payloads also expose `token_usage_visibility.status` and `token_usage_visibility.unavailable_reason_code`.

Registered custom subagents are the default execution path. Host Codex as captain owns LongWay, routing, lifecycle, fan-in, review, validation, and commit boundaries. Ordinary `$cap` work should go to the matching specialist first: read-only investigation to `ccc_scout`, docs/operator text to `ccc_scribe`, code/config mutation to `ccc_raider`, and review judgment to `ccc_arbiter`. Route-backed lightweight filesystem/docs/fetch/git/gh work should use the configured companion owner: git and `gh` reads go to `companion_reader`, and git or `gh` mutations go to `companion_operator` unless the captain records fallback/degradation. The captain should only do the work directly for explicit fallback, trivial operator-side fixes, or recorded CCC degradation.

Direct `codex exec` fallback is blocked while a custom subagent is available unless an explicit fallback or codex override is recorded.

## Recommended Role Defaults

| CCC role | Agent | Recommended model | Reasoning | Notes |
| --- | --- | --- | --- | --- |
| `orchestrator` | `captain` | `gpt-5.5` | `high` | LongWay ownership and final routing judgment |
| `way` | `tactician` | `gpt-5.5` | `medium` | Planning and bounded next-move selection |
| `explorer` | `scout` | `gpt-5.4-mini` | `high` | Read-only repo evidence |
| `code specialist` | `raider` | `gpt-5.5` | `high` | Code/config mutation and repair |
| `documenter` | `scribe` | `gpt-5.4-mini` | `high` | README, release notes, and operator text |
| `verifier` | `arbiter` | `gpt-5.5` | `medium` | Review, risk, regression, and acceptance checks |
| `companion_reader` | `companion_reader` | `gpt-5.4-mini` | `high` | Low-cost filesystem/docs/web/git/gh read work |
| `companion_operator` | `companion_operator` | `gpt-5.4-mini` | `high` | Low-cost bounded git/gh mutation and narrow tool work |

`gpt-5.5` is recommended for the high-value roles when Codex is signed in with ChatGPT. If it is unavailable in the current account or execution path, use `gpt-5.4` for those roles until rollout reaches that path.

## Release Note

- [`docs/release/notes/v0.0.4.md`](./docs/release/notes/v0.0.4.md): current public release card body
