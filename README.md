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

Installing this package does not remove operator control over that file. The postinstall bootstrap and `codex-foreman setup` continue to create or reuse it instead of hiding config inside repository-local state.

## What is included

- built `dist/` binaries
- runtime `schemas/`
- the bootstrap script that creates or reuses shared Foreman config
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

- source repo commit: 5552ddb7d6a20cdd3b2070323aa0e2941a31a3d2
