# Codex-Cli-Captain-Release

Install Codex-Cli-Captain for Codex CLI.

Use `$cap` when you want captain to route work across the right agents in order, using the models and reasoning levels from `ccc-config.toml`.

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
- `$cap` skill
- `~/.config/foreman/ccc-config.toml`

## Healthy Check

```text
CCC install check: status=ok version=0.0.1 entry=$cap registration=matching_registration config=present skill=matching_install
```
