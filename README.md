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

## Using `$cap`

Write the request with the intended boundary:

- `inspect ... and report findings only`: read-only `scout` investigation, no mutation
- `check ... and fix if needed`: evidence first, then conditional `raider` or `scribe` work only if a mismatch is found
- `implement ... run tests ...`: bounded implementation on `raider`, then `arbiter` review
- `update README/docs ...`: document work on `scribe`, not `raider`
- `continue current run`: reuse the active run instead of starting a fresh one

Small, scoped requests are faster. Mention files, tests, and acceptance criteria when you know them.

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
- five canonical route families: `read_only`, `mutation`, `planning`, `verification`, `parallel`
- request-shape checks that keep read-only work off mutation routes
- configured role model, reasoning, and per-agent fast-mode launch policy
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
- `model_policy=coherent`
- `tool_policy=coherent`

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

Foreman prepares and records the local archive bundle. Direct NotebookLM source upload remains host-driven through the NotebookLM MCP.

## Phase Chain

`$cap` uses `foreman_orchestrate` with `progression_mode=drain_until_boundary` when a Foreman phase chain should continue without operator input. Background `codex exec` launches use the configured role profile, model, reasoning effort, extra config entries, and per-agent fast-mode setting from `foreman-config.json`.

## Route Families

- `read_only`: `captain -> scout -> captain`
- `mutation`: `captain -> scout? -> raider or scribe -> arbiter -> captain`
- `planning`: `captain -> tactician -> worker -> arbiter -> captain`
- `verification`: `captain -> scout? -> arbiter -> captain`
- `parallel`: bounded fan-out, fan-in, then optional review

Older route names are compatibility aliases for persisted runs.

## Run Hygiene

```bash
codex-foreman clear-runs --cwd /absolute/workspace/path --include-blocked
codex-foreman maintain-runs --cwd /absolute/workspace/path --action archive
codex-foreman maintain-runs --cwd /absolute/workspace/path --action prune
```

These commands ship in the release tarball and do not depend on npm registry publication.

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

Source commit: 656aa9e2adee11039a26597f34f2d89f9ccd3852
Release assets: https://github.com/HoRi0506/Codex-Foreman-release/releases
