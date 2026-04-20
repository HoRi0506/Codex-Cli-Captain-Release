# codex-foreman

Captain-first Foreman toolbox for Codex CLI.

Install. Run setup. Restart Codex CLI. Use `$cap`.

Beta releases are installed from GitHub Release tarballs in this install-only repository, not from the public npm registry.

## Install

Copy this into Codex CLI:

```text
Run these shell commands exactly in order without browsing or searching first. If one command fails, stop and report that failure.

npm install -g https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.6.2/codex-foreman-1.6.2.tgz
codex-foreman setup
codex-foreman check-install

Verify that `codex-foreman check-install` reports `status=ok`, that the packaged `$cap` skill is installed, and that the packaged Codex custom agents are installed.
Do not ask me to type the shell commands manually.
Finish with exactly: Please restart Codex CLI.
```

Direct shell reference:

```bash
npm install -g https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.6.2/codex-foreman-1.6.2.tgz
codex-foreman setup
codex-foreman check-install
```

## Use

```text
$cap inspect this repository and report findings only
$cap implement the scoped fix, run tests, then commit and push
$cap continue current run
$cap close current run
```

Each fresh `$cap` request starts a new request-run by default.

## What You Get

- captain-first routing
- bounded scout, raider, arbiter, and companion-owner paths
- request-shape checks that keep read-only work off mutation routes
- compact status and run-hygiene visibility
- local route journals under `.foreman/sessions/<session-id>/`

Codex remains the orchestrator. Foreman does not proxy Codex auth.

## Status

```bash
codex-foreman check-install
codex-foreman status --run-id <id>
codex-foreman watch --run-id <id>
```

Healthy install output should include:

- `status=ok`
- `registration=matching_registration`
- `skill=matching_install`
- `agents=matching_install`
- `notebooklm_archive=disabled` or a concrete readiness state

## NotebookLM

Register the optional companion MCP:

```bash
codex mcp add notebooklm -- npx -y notebooklm-mcp@latest
```

Restart Codex CLI after registration.

Readiness check:

```bash
codex-foreman notebooklm-status --cwd /absolute/repo/path
```

Repo-scoped export:

```bash
codex-foreman notebooklm-export-session --run-id <id> --cwd /absolute/repo/path
```

1.6.2 boundary: Foreman prepares and records the local archive bundle, but direct NotebookLM source upload is still host-driven.

## Run Hygiene

```bash
codex-foreman clear-runs --cwd /absolute/workspace/path --include-blocked
codex-foreman maintain-runs --cwd /absolute/workspace/path --action archive
codex-foreman maintain-runs --cwd /absolute/workspace/path --action prune
codex-foreman maintain-runs --cwd /absolute/workspace/path --action archive --apply
```

These commands are shipped in the release tarball.

## Roles

| Name | Job |
| --- | --- |
| `captain` | route, supervise, synthesize |
| `tactician` | scope and plan |
| `scout` | gather bounded evidence |
| `raider` | execute scoped mutation |
| `arbiter` | review and decide pass, repair, or hold |
| `sentinel` | classify ownership and execution-path drift |

## Files

- `skills/cap/SKILL.md`: public `$cap` skill
- `agents/`: packaged Foreman custom-agent roster
- `schemas/`: packaged config and specialist-contract schemas
- `docs/install.md`: full install/update guide
- `docs/release/notes/v1.6.2.md`: release notes

Source commit: e09c0ac437b4178e80efcc8f039213c88812a965
Release assets: https://github.com/HoRi0506/Codex-Foreman-release/releases
