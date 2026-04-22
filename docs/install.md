# Install Codex-Foreman 0.0.1

Use this guide for the Rust-only `0.0.1` release bundle.

## Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/HoRi0506/Codex-Foreman-release/main/install.sh | bash
```

The installer script:

- detects the local OS and architecture
- downloads the matching release asset
- installs the bundle under `~/.local/share/codex-foreman/current`
- links `codex-foreman` into `~/.local/bin`
- runs `codex-foreman setup`
- runs `codex-foreman check-install`

After it finishes, restart Codex CLI.

## Manual Install

1. download and unpack the release bundle for your platform
2. from the unpacked directory, run:

```bash
./bin/codex-foreman setup
./bin/codex-foreman check-install
```

3. restart Codex CLI

## Installer Variables

The installer supports these optional environment variables:

- `CODEX_FOREMAN_VERSION`: release tag to install, defaults to `v0.0.1`
- `CODEX_FOREMAN_INSTALL_ROOT`: install root, defaults to `~/.local/share/codex-foreman`
- `CODEX_FOREMAN_BIN_DIR`: directory for the `codex-foreman` symlink, defaults to `~/.local/bin`
- `CODEX_FOREMAN_DOWNLOAD_URL`: explicit asset URL override, useful for local testing

## Healthy Check

`codex-foreman check-install` should report:

```text
Foreman install check: status=ok version=0.0.1 entry=$cap registration=matching_registration config=present skill=matching_install
```

## What Setup Does

- registers or refreshes the `codex-foreman` MCP entry in Codex CLI
- creates `~/.config/foreman/foreman-config.toml` on first install using the canonical shared-config format
- reuses the existing `~/.config/foreman/foreman-config.toml` when it is already present
- migrates legacy `~/.config/foreman/foreman-config.json` when present
- installs or refreshes the public `$cap` skill under `CODEX_HOME`

The generated shared TOML config includes the default per-role `model`, reasoning tier (`variant`), `fast_mode`, and `config_entries` values. Runtime dispatch reads those values from `foreman-config.toml` when it launches delegated `codex exec` work, rather than hardcoding model or reasoning choices in the installer flow.

## Use

After restarting Codex CLI:

```text
$cap inspect this repository and report findings only
$cap implement the scoped fix, run tests, then commit and push
```
