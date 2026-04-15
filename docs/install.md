# Install Codex-Foreman

Use this guide when you want to install or update Codex-Foreman without keeping a cloned release repository on disk after installation.

## Codex-guided flow

If Codex is assisting with installation, point it at this file and tell it:

> Read this install guide, install codex-foreman 0.2.0 on this machine, verify the install, and finish with: Please restart Codex CLI.

## Preferred install path

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
