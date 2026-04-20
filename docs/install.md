# Install Codex-Foreman

Use this guide for the packaged beta install surface.

Beta releases are installed from GitHub Release tarballs in the install-only repository, not from the public npm registry.

## Paste Into Codex CLI

Copy this text into Codex CLI:

```text
Run these shell commands exactly in order without browsing or searching first. If one command fails, stop and report that failure.

npm install -g https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.6.4/codex-foreman-1.6.4.tgz
codex-foreman setup
codex-foreman check-install

Verify that `codex-foreman check-install` reports `status=ok`, that the MCP registration matches the installed entrypoint, that the packaged `$cap` skill is installed, and that the packaged Codex custom agents are installed.
Do not ask me to type the shell commands manually.
Finish with exactly: Please restart Codex CLI.
```

## Install

```bash
npm install -g https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.6.4/codex-foreman-1.6.4.tgz
codex-foreman setup
codex-foreman check-install
```

Then restart Codex CLI.

## Update

To update to `v1.6.4`, rerun the same three commands.

There is no separate `mcp update` command today.

`codex-foreman setup` refreshes the packaged `$cap` skill and the packaged Foreman custom-agent roster.

## NotebookLM MCP

Register the optional companion MCP:

```bash
codex mcp add notebooklm -- npx -y notebooklm-mcp@latest
```

Restart Codex CLI after registration.

Foreman readiness check:

```bash
codex-foreman notebooklm-status --cwd /absolute/repo/path
```

Explicit NotebookLM auth check inside Codex:

- call NotebookLM MCP `get_health`
- confirm `authenticated=true`

Repo-scoped export:

```bash
codex-foreman notebooklm-export-session --run-id <id> --cwd /absolute/repo/path
```

Current boundary:

- Foreman prepares and records the local archive bundle.
- Foreman reports NotebookLM readiness honestly.
- Direct NotebookLM source upload is still host-driven.

## Phase Chain

`$cap` uses `foreman_orchestrate` with `progression_mode=drain_until_boundary` when Foreman can keep a phase chain moving without operator input. Foreman drains across task boundaries until a terminal, manual, fan-in, timeout, or max-step boundary.

Background `codex exec` launches use `foreman-config.json` role settings: `profile`, `model`, `model_reasoning_effort`, extra `config_entries`, and per-agent `fast_mode`. Enabled fast-mode workers launch with `service_tier=fast`.

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

These commands are part of the packaged release tarball.

## Healthy output example

```text
Foreman install check: status=ok version=1.6.4 entry=$cap registration=matching_registration config=present skill=matching_install agents=matching_install package_surface=coherent_surface companion_mcps=0 notebooklm_archive=disabled model_policy=coherent tool_policy=coherent run_hygiene=clean
Current package: codex-foreman@1.6.4
Public entry: $cap (skill=cap)
Model policy: Configured role-model policy: captain=gpt-5.4/high tactician=gpt-5.4/medium scout=gpt-5.4-mini/medium raider=gpt-5.3-codex/high arbiter=gpt-5.4/medium companion_reader=gpt-5.4-mini/medium companion_operator=gpt-5.4-mini/medium
Companion tool policy: Configured companion routing keeps tool work under specialist ownership: filesystem->companion_reader/gpt-5.4-mini/medium, git(read)->companion_reader/gpt-5.4-mini/medium git(mutation)->companion_operator/gpt-5.4-mini/medium, context7->companion_reader/gpt-5.4-mini/medium, fetch->companion_reader/gpt-5.4-mini/medium, openaiDeveloperDocs->companion_reader/gpt-5.4-mini/medium.
NotebookLM archive: NotebookLM archive target is disabled. To enable it, register notebooklm MCP, complete browser auth, then set archive_targets.notebooklm.enabled=true with notebook_url or notebook_id.
Run hygiene: clean; workspace=<cwd> active=0 blocked=0 fresh=0 stale=0 resumable=none.
```

## Notes

- `codex-foreman setup` handles MCP registration plus packaged skill and agent refresh.
- Codex authentication stays on normal Codex login paths.
- NotebookLM authentication stays on NotebookLM browser auth.
- Foreman does not proxy or scrape OAuth credentials.
- Published release assets live under https://github.com/HoRi0506/Codex-Foreman-release/releases

Please restart Codex CLI.
