# codex-foreman

Bring a captain-first workflow to Codex CLI without replacing the way you already work.

Codex-Foreman adds a local MCP server, a sibling CLI, a launcher wrapper, persisted run state, and the packaged `$cap` skill so requests can enter Foreman through `captain` before they fall back to the host Codex session.

This repository is the install-facing release surface for Codex-Foreman 0.5.0. It is generated from the source repository and keeps the focus on install, setup, and everyday operator use.

## Why Use It

- start work through `captain` with `$cap <request>`
- keep Foreman state, run visibility, and MCP registration in one local workflow
- use the same Codex environment while letting Foreman coordinate the entry path
- keep shared operator config in `$XDG_CONFIG_HOME/foreman/foreman-config.json` or `~/.config/foreman/foreman-config.json`

## Install

Copy this text into Codex CLI:

```text
Install the latest published codex-foreman package on this machine from npm. If this repository is available locally, read `docs/install.md` before you start and follow it as the source of truth. Run `codex-foreman setup`, then run `codex-foreman check-install`. Verify that `codex-foreman check-install` reports `status=ok` and that the packaged `$cap` skill is installed. Do not ask me to type the shell commands manually. Execute them yourself and finish with exactly: Please restart Codex CLI.
```

Detailed install reference:

- [docs/install.md](./docs/install.md)

That guide covers:

- `codex-foreman`
- `codex-foreman-mcp`
- `codex-foreman-codex`
- the packaged `$cap` skill
- no-clone install from npm or a released tarball
- setup through `codex-foreman setup`
- verification through `codex-foreman check-install`
- the final Codex CLI restart step

## Quick Start

After install and restart:

- use `$cap <your request>` when you want the request to enter Foreman through `captain`
- use `codex-foreman check-install` when you want to confirm the install boundary is still healthy
- use `foreman_server_identity` when you want to confirm the attached MCP session and build

Foreman can also work alongside other installed MCP servers such as `context7`, `fetch`, `filesystem`, and `git` when they are available in the same Codex environment.

## Included Tools

- `codex-foreman`: setup, checks, and explicit Foreman commands
- `codex-foreman-mcp`: the MCP server Codex connects to
- `codex-foreman-codex`: the launcher wrapper for Foreman-first entry
- the packaged `$cap` skill: the operator-facing shortcut that sends work to `captain` first

## Config

The shared editable config stays here:

- `$XDG_CONFIG_HOME/foreman/foreman-config.json`
- `~/.config/foreman/foreman-config.json`

`codex-foreman setup` is the primary supported path for creating or reusing that file after install. The shipped bootstrap helper remains available as a manual fallback instead of hiding config inside repository-local state.

## What is included

- built `dist/` binaries
- runtime `schemas/`
- packaged `skills/` content for `$cap`
- the bootstrap helper script for manual config bootstrapping
- package metadata for install and packaging

## What is intentionally not included

- source TypeScript files
- tests
- roadmap docs
- broader development history or internal implementation layout

## Notes

- This repository is for install and execution, not source development.
- Managed install-surface files may be replaced by the next export run from the source repository.

## Provenance

- source repo commit: 093744cd8fb06db0f49c64e4a82a2360c3c8b9c8
