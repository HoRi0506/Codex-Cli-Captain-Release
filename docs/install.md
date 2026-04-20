# Install Codex-Foreman

Use this guide when you want to install or update Codex-Foreman without keeping a cloned release repository on disk after installation.

This is the supported beta install path. Beta releases are distributed through GitHub Release tarballs from the install-only release repository, not through the public npm registry.

## Paste Into Codex CLI

Copy this text into Codex CLI:

```text
Run these shell commands exactly in order without browsing or searching first. If one command fails, stop and report that failure.

npm install -g https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.6.1/codex-foreman-1.6.1.tgz
codex-foreman setup
codex-foreman check-install

Verify that `codex-foreman check-install` reports `status=ok`, that the MCP registration matches the installed entrypoint, that the packaged `$cap` skill is installed, and that the packaged Codex custom agents are installed.
Do not ask me to type the shell commands manually.
Finish with exactly: Please restart Codex CLI.
```

If Codex has access to this repository, tell it to read this file before it starts so it follows the documented install and verification flow exactly.

## Shell Reference

Codex should execute these steps for the preferred install path:

Install from the exact release tarball:

```bash
npm install -g https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.6.1/codex-foreman-1.6.1.tgz
```

Then register or refresh the MCP entrypoint:

```bash
codex-foreman setup
```

That step also installs or refreshes the packaged `$cap` skill under your local Codex skills directory and the packaged Foreman custom-agent roster under your local Codex agents directory.

Verify the install:

```bash
codex-foreman check-install
```

## Update

To update an existing install on this machine for `v1.6.1`, rerun the same three commands against this release tarball:

```bash
npm install -g https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.6.1/codex-foreman-1.6.1.tgz
codex-foreman setup
codex-foreman check-install
```

The tarball command refreshes the installed package version, and `setup` refreshes the MCP registration, packaged skill, and packaged custom agents.

If a workspace already has stale persisted active runs outside the request-scoped `$cap` flow, clear them with:

```bash
codex-foreman clear-runs --cwd /absolute/workspace/path --include-blocked
```

That bounded maintenance path cancels legacy persisted runs for the target workspace and prints the post-clear hygiene summary right away.

For retention candidates, inspect first and apply only when the candidate list is expected:

```bash
codex-foreman maintain-runs --cwd /absolute/workspace/path --action archive
codex-foreman maintain-runs --cwd /absolute/workspace/path --action prune
codex-foreman maintain-runs --cwd /absolute/workspace/path --action archive --apply
```

## Local tarball fallback

If you already downloaded the release asset locally, use:

```bash
npm install -g /absolute/path/to/codex-foreman-<version>.tgz
codex-foreman setup
codex-foreman check-install
```

This path still does not require keeping a cloned release repository after the install succeeds.

## Verification checklist

The install is in the expected state when:

- `codex-foreman check-install` reports `status=ok`
- the registration summary says the installed MCP entrypoint matches
- the skill summary says `$cap` matches the packaged Foreman skill content
- the custom-agent summary says the packaged Foreman agent roster matches
- the model-policy summary shows the configured role-model map you expect
- the run-hygiene summary does not report unexpected active-run buildup
- `foreman_server_identity` reports the expected MCP build after the next Codex session starts
- after restarting Codex CLI, you can invoke `$cap` to enter the captain-first Foreman path

## Healthy output example

```text
Foreman install check: status=ok version=1.6.1 entry=$cap registration=matching_registration config=present skill=matching_install agents=matching_install package_surface=coherent_surface companion_mcps=0 notebooklm_archive=disabled model_policy=coherent tool_policy=coherent run_hygiene=clean
Current package: codex-foreman@1.6.1
Public entry: $cap (skill=cap)
Model policy: Configured role-model policy: captain=gpt-5.4/high tactician=gpt-5.4/medium scout=gpt-5.4-mini/medium raider=gpt-5.3-codex/high arbiter=gpt-5.4/medium companion_reader=gpt-5.4-mini/medium companion_operator=gpt-5.4-mini/medium
Companion tool policy: Configured companion routing keeps tool work under specialist ownership: filesystem->companion_reader/gpt-5.4-mini/medium, git(read)->companion_reader/gpt-5.4-mini/medium git(mutation)->companion_operator/gpt-5.4-mini/medium, context7->companion_reader/gpt-5.4-mini/medium, fetch->companion_reader/gpt-5.4-mini/medium, openaiDeveloperDocs->companion_reader/gpt-5.4-mini/medium.
NotebookLM archive: NotebookLM archive target is disabled.
Run hygiene: clean; workspace=<cwd> active=0 blocked=0 fresh=0 stale=0 resumable=none.
```

## Notes

- There is no separate `mcp update` command today.
- `codex-foreman setup` handles MCP registration, packaged `$cap` skill installation, packaged custom-agent installation, and conflict checks; it is not the package installer
- Codex authentication stays on supported Codex login paths; Foreman does not proxy or scrape OAuth credentials
- install from the GitHub release tarball when you want a no-clone setup
- published release assets live under https://github.com/HoRi0506/Codex-Foreman-release/releases

Please restart Codex CLI.
