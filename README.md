# Codex-Cli-Captain-Release

<p align="center">
  <a href="./README.md">English</a> ·
  <a href="./README.ko.md">한국어</a> ·
  <a href="./README.ja.md">日本語</a>
</p>

<p align="center">
  <img src="./docs/assets/ccc-banner.svg" alt="CCC Codex-Cli-Captain banner" width="100%">
</p>

Current public release: `0.0.3`.

Codex CLI is already smart. Want to use that intelligence with a little more structure? New higher-budget plans are here, and your work deserves a captain that spends that budget on a reasonable path, not random wandering. Welcome to CCC: add `$cap` to your request, and Codex-Cli-Captain will guide the work through a captain-led process before returning the result.

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

## Release Note

- [`docs/release/notes/v0.0.3.md`](./docs/release/notes/v0.0.3.md): current public release card body
