# Install Codex-Foreman

Use this guide when you want to install or update Codex-Foreman without keeping a cloned release repository on disk after installation.

## Paste Into Codex CLI

Copy this text into Codex CLI:

```text
Install codex-foreman 0.2.0 on this machine from npm, run `codex-foreman setup`, then run `codex-foreman check-install`. Verify that `codex-foreman check-install` reports `status=ok` and that the MCP registration matches the installed entrypoint. Do not ask me to type the shell commands manually. Execute them yourself and finish with exactly: Please restart Codex CLI.
```

If Codex has access to this repository, tell it to read this file before it starts so it follows the documented install and verification flow exactly.

## Shell Reference

Codex should execute these steps for the preferred install path:

Install from the published package:

```bash
npm install -g codex-foreman@0.2.0
```

Then register or refresh the MCP entrypoint:

```bash
codex-foreman setup
```

Verify the install:

```bash
codex-foreman check-install
```

## Tarball fallback

If you are installing from a released tarball instead of the npm registry, use:

```bash
npm install -g /absolute/path/to/codex-foreman-0.2.0.tgz
codex-foreman setup
codex-foreman check-install
```

This path still does not require keeping a cloned release repository after the install succeeds.

## Verification checklist

The install is in the expected state when:

- `codex-foreman check-install` reports `status=ok`
- the registration summary says the installed MCP entrypoint matches
- `foreman_server_identity` reports the expected MCP build after the next Codex session starts

## Notes

- there is no separate `mcp update` command today
- `codex-foreman setup` handles MCP registration and conflict checks; it is not the package installer
- install from npm or from a release tarball when you want a no-clone setup

Please restart Codex CLI.
