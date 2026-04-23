# Codex-Cli-Captain-Release

Install Codex-Cli-Captain for Codex CLI.

Current public release: `0.0.2`.

Codex is already smart. Use `$cap` when you want captain to route work across the right agents in order, using the models and reasoning levels from `ccc-config.toml` instead of burning your most expensive model on every step.

## Install

Copy this into Codex CLI:

```text
Install Codex-Cli-Captain from https://github.com/HoRi0506/Codex-Cli-Captain-Release by running:
curl -fsSL https://raw.githubusercontent.com/HoRi0506/Codex-Cli-Captain-Release/main/install.sh | bash

After installation finishes, fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

## What You Get

- `ccc` CLI and MCP entrypoint
- compact `$cap` skill
- `~/.config/foreman/ccc-config.toml`
- CCC-managed custom agents synced from `ccc-config.toml`
- runtime companion routing that can send lightweight filesystem/docs/fetch/git work to the configured `gpt-5.4-mini` companion roles
- compact captain/subagent status payloads for lower repeated token cost
- lane-aware raider fan-out/fan-in V1 with stable `raider-a` through `raider-d` lanes, a default of 2 lanes only for explicit disjoint parallel work, and a hard maximum of 4 lanes
- lower-noise `--text`, `--quiet`, and `--json-file` surfaces for repeated lifecycle updates
- host-side token status for custom subagents is best-effort only; use `child_agent_id` for the CCC role or managed agent and `thread_id` for the raw host Codex thread/session identifier

## Healthy Check

```text
CCC install check: status=ok version=0.0.2 entry=$cap registration=matching_registration config=present skill=matching_install
```

## Release Note

- [`docs/release/notes/v0.0.2.md`](./docs/release/notes/v0.0.2.md): current public release card body
