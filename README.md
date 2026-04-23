# Codex-Cli-Captain-Release

Install-only release surface for the Rust-only `ccc` `0.0.1` baseline.

Codex is already smart. Codex-Cli-Captain is for making that intelligence cheaper and more disciplined. Use `$cap` when you want the work split across the right specialists in the right order, using the models and reasoning levels you configured in `foreman-config.toml`, instead of burning your most expensive model on every step.

This repository is not the development source. It exists to publish the release bundle, install docs, the packaged `$cap` skill, and the public GitHub release card for `v0.0.1`.

## Install

Copy this into Codex CLI:

```text
Install Codex-Cli-Captain from https://github.com/HoRi0506/Codex-Cli-Captain-Release by running:
curl -fsSL https://raw.githubusercontent.com/HoRi0506/Codex-Cli-Captain-Release/main/install.sh | bash

After installation finishes, fully exit Codex CLI.
Start a new Codex CLI session.
Then run:
ccc check-install
```

If you want to run the installer directly in your shell:

```bash
curl -fsSL https://raw.githubusercontent.com/HoRi0506/Codex-Cli-Captain-Release/main/install.sh | bash

# fully exit Codex CLI
# start a new Codex CLI session
ccc check-install
```

## Layout

- `bin/ccc`: Rust CLI and MCP entrypoint
- `install.sh`: one-line installer entrypoint
- `share/skills/cap/SKILL.md`: packaged public `$cap` skill
- `docs/install.md`: install and verification guide
- `docs/release/notes/v0.0.1.md`: public release note
- `release-repo-manifest.json`: packaged release surface summary

## Notes

- npm is no longer the public install path for this baseline.
- `install.sh` downloads the platform bundle that matches its asset naming convention.
- The release bundle is expected to keep the binary and `share/skills/cap/SKILL.md` together.
- setup creates `~/.config/foreman/foreman-config.toml` on first install, reuses it on later runs, and migrates legacy JSON config when present.
- Delegated model and reasoning selection come from `foreman-config.toml`; the installer only seeds the default shared config.
- The public `$cap` path for `0.0.1` is explicit captain-first entry. `Way` creates a `LongWay`, then captain selects one specialist at a time inside the same run. `ccc_auto_entry` remains available for compatibility and diagnostics only.
- `Codex-Cli-Captain-Release` owns the public GitHub release card. `Codex-Cli-Captain` is only the development source repository.
