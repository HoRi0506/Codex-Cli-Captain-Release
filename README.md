# codex-foreman-release

Install-only release surface for the Rust-only `codex-foreman` `0.0.1` baseline.

This repository is not the development source. It exists to publish the release bundle, install docs, and the public `$cap` asset that the Rust binary installs into Codex.

## Install

Copy this into Codex CLI:

```text
Install Codex-Foreman from https://github.com/HoRi0506/Codex-Foreman-release by running:
curl -fsSL https://raw.githubusercontent.com/HoRi0506/Codex-Foreman-release/main/install.sh | bash

After installation finishes, you must restart Codex CLI.
Then run:
codex-foreman check-install
```

If you want to run the installer directly in your shell:

```bash
curl -fsSL https://raw.githubusercontent.com/HoRi0506/Codex-Foreman-release/main/install.sh | bash

# restart Codex CLI
codex-foreman check-install
```

## Manual Install

If you prefer not to use the installer script, download the current release bundle from the Releases page, unpack it, and run:

```bash
./bin/codex-foreman setup
./bin/codex-foreman check-install
```

## Layout

- `bin/codex-foreman`: Rust CLI and MCP entrypoint
- `install.sh`: one-line installer entrypoint
- `share/skills/cap/SKILL.md`: packaged public `$cap` skill
- `docs/install.md`: install and verification guide
- `docs/release/notes/v0.0.1.md`: public release note
- `release-repo-manifest.json`: packaged release surface summary

## Notes

- npm is no longer the public install path for this baseline.
- `install.sh` downloads the platform bundle that matches its asset naming convention.
- The release bundle is expected to keep the binary and `share/skills/cap/SKILL.md` together.
- The source repository is `codex-foreman`; this repository is only the release/install surface.
