# codex-foreman

Install-only release surface for Codex-Foreman 0.2.0.

This repository is generated from the source-of-truth development repository and intentionally ships only the install boundary.

## Install

Copy this text into Codex CLI:

```text
Install the latest published codex-foreman package on this machine from npm. If this repository is available locally, read `docs/install.md` before you start and follow it as the source of truth. Run `codex-foreman setup`, then run `codex-foreman check-install`. Verify that `codex-foreman check-install` reports `status=ok`. Do not ask me to type the shell commands manually. Execute them yourself and finish with exactly: Please restart Codex CLI.
```

Detailed install reference:

- [docs/install.md](./docs/install.md)

That guide covers:

- `codex-foreman`
- `codex-foreman-mcp`
- `codex-foreman-codex`
- no-clone install from npm or a released tarball
- setup through `codex-foreman setup`
- verification through `codex-foreman check-install`
- the final Codex CLI restart step

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
