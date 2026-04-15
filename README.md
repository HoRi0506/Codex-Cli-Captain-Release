# codex-foreman

Install-only release surface for Codex-Foreman 0.0.1.

This repository is generated from the source-of-truth development repository and intentionally ships only the install boundary.

## Install

Use one of these paths:

```bash
npm install
npm link
```

That makes these commands available:

- `codex-foreman`
- `codex-foreman-mcp`
- `codex-foreman-codex`

## Setup

Register the MCP server with plain Codex CLI through the explicit wrapper:

```bash
codex-foreman setup
```

That registers the installed MCP entrypoint and creates or reuses the shared Foreman config.

## Shared config contract

The shared editable config stays here:

- `$XDG_CONFIG_HOME/foreman/foreman-config.json`
- `~/.config/foreman/foreman-config.json`

Installing this package does not remove operator control over that file. `codex-foreman setup` is the primary supported path for creating or reusing it after install, and the shipped bootstrap helper remains available as a manual fallback instead of hiding config inside repository-local state.

## What is included

- built `dist/` binaries
- runtime `schemas/`
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
