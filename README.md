# codex-foreman

Captain-first Foreman toolbox for Codex CLI.

Use it when a request needs visible routing, worker proof, review boundaries, and install/runtime hygiene instead of one opaque Codex turn.

Install. Run setup. Restart Codex CLI. Use `$cap`.

Beta releases are installed from GitHub Release tarballs in this install-only repository. The public npm registry is not the supported beta install surface.

## Install

Copy this into Codex CLI:

```text
Run these shell commands exactly in order without browsing or searching first. If one command fails, stop and report that failure.

npm install -g https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.5.40/codex-foreman-1.5.40.tgz
codex-foreman setup
codex-foreman check-install

Verify that `codex-foreman check-install` reports `status=ok`, that the packaged `$cap` skill is installed, and that the packaged Codex custom agents are installed.
Do not ask me to type the shell commands manually.
Finish with exactly: Please restart Codex CLI.
```

Direct shell reference:

```bash
npm install -g https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.5.40/codex-foreman-1.5.40.tgz
codex-foreman setup
codex-foreman check-install
```

Restart Codex CLI after setup or update.

## Use

```text
$cap inspect this repository and report findings only; do not edit files
$cap update the release README with usage tips, run tests, then commit and push
$cap continue current run
$cap close current run
```

Each fresh `$cap` request starts a new request-run by default. Ask to continue or resume only when you intentionally want the current run reused.

## What You Get

- captain-first route selection before specialist work
- bounded scout, raider, arbiter, and companion-owner execution paths
- request-shape checks that keep read-only work off mutation routes
- mutation proof and review boundaries before final synthesis
- compact status surfaces for route, role/model, fallback, and run hygiene truth
- local session route journals under `.foreman/sessions/<session-id>/`

Codex remains the orchestrator. Foreman does not proxy Codex auth and does not replace the Codex CLI binary.

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
- coherent model and companion-tool policy
- clean or explainable run hygiene

## Run Hygiene

```bash
codex-foreman clear-runs --cwd /absolute/workspace/path --include-blocked
codex-foreman maintain-runs --cwd /absolute/workspace/path --action archive
codex-foreman maintain-runs --cwd /absolute/workspace/path --action prune
codex-foreman maintain-runs --cwd /absolute/workspace/path --action archive --apply
```

`maintain-runs` is dry-run-first. Add `--apply` only after the candidate list is expected.

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
- `docs/release/notes/v1.5.40.md`: release notes

Source commit: d687389de623aaa59916de5cf5f0cf73cd632f14
Release assets: https://github.com/HoRi0506/Codex-Foreman-release/releases
