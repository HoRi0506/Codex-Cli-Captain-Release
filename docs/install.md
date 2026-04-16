# Install Codex-Foreman

Use this guide when you want to install or update Codex-Foreman without keeping a cloned release repository on disk after installation.

## Paste Into Codex CLI

Copy this text into Codex CLI:

```text
Install codex-foreman on this machine from the GitHub release tarball https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.4.0/codex-foreman-1.4.0.tgz. Do not assume a published npm registry package exists. If this repository is available locally, read `docs/install.md` before you start and follow it as the source of truth. Run `codex-foreman setup`, then run `codex-foreman check-install`. Verify that `codex-foreman check-install` reports `status=ok`, that the MCP registration matches the installed entrypoint, that the packaged `$cap` skill is installed, and that the packaged Codex custom agents are installed. Do not ask me to type the shell commands manually. Execute them yourself and finish with exactly: Please restart Codex CLI.
```

If Codex has access to this repository, tell it to read this file before it starts so it follows the documented install and verification flow exactly.

## Shell Reference

Codex should execute these steps for the preferred install path:

Install from the exact release tarball:

```bash
npm install -g https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.4.0/codex-foreman-1.4.0.tgz
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
- `foreman_server_identity` reports the expected MCP build after the next Codex session starts
- after restarting Codex CLI, you can invoke `$cap` to enter the captain-first Foreman path

## Notes

- there is no separate `mcp update` command today
- `codex-foreman setup` handles MCP registration, packaged `$cap` skill installation, packaged custom-agent installation, and conflict checks; it is not the package installer
- Codex authentication stays on supported Codex login paths; Foreman does not proxy or scrape OAuth credentials
- install from the GitHub release tarball when you want a no-clone setup

Please restart Codex CLI.
