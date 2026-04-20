# codex-foreman

Captain-first Foreman toolbox for Codex CLI.

Install. Run setup. Restart Codex CLI. Use `$cap`.

Beta releases are installed from GitHub Release tarballs in this install-only repository, not from the public npm registry.

## Install

Copy this into Codex CLI:

```text
Run these shell commands exactly in order without browsing or searching first. If one command fails, stop and report that failure.

npm install -g https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.6.4/codex-foreman-1.6.4.tgz
codex-foreman setup
codex-foreman check-install

Verify that `codex-foreman check-install` reports `status=ok`, that the packaged `$cap` skill is installed, and that the packaged Codex custom agents are installed.
Do not ask me to type the shell commands manually.
Finish with exactly: Please restart Codex CLI.
```

Direct shell reference:

```bash
npm install -g https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.6.4/codex-foreman-1.6.4.tgz
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
- bounded scout, raider, scribe, arbiter, and companion-owner paths
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

Current boundary: Foreman prepares and records the local archive bundle, but direct NotebookLM source upload is still host-driven.

## Phase Chain

`$cap` uses `foreman_orchestrate` with `progression_mode=drain_until_boundary` when a Foreman phase chain should continue without operator input. Background `codex exec` launches use the configured role profile, model, reasoning effort, extra config entries, and per-agent fast-mode setting from `foreman-config.json`.

## Tool Routing

Foreman cannot intercept arbitrary host Codex tools after those tools are exposed to the host session. Under `$cap`, host-local git/filesystem mutation is forbidden while Foreman owns the run unless the operator explicitly approves a bypass in that turn.

- git read: `companion_reader`
- git mutation: `companion_operator`
- filesystem/docs/fetch/reference reads: `companion_reader`

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
| `raider` | execute code, config, and test mutation |
| `scribe` | write docs, README, release notes, and operator guidance |
| `arbiter` | review and decide pass, repair, or hold |
| `sentinel` | classify ownership and execution-path drift |

## Files

- `skills/cap/SKILL.md`: public `$cap` skill
- `agents/`: packaged Foreman custom-agent roster
- `schemas/`: packaged config and specialist-contract schemas
- `docs/install.md`: full install/update guide
- `docs/release/notes/v1.6.4.md`: release notes

Source commit: 5b7dd72cdf860b8c3c20ba6e28c982541074d60a
Release assets: https://github.com/HoRi0506/Codex-Foreman-release/releases
