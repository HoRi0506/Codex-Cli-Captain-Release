# Install Codex-Cli-Captain 0.0.2

Use this guide for the Rust-only `0.0.2` release bundle.

## Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/HoRi0506/Codex-Cli-Captain-Release/main/install.sh | bash
```

The installer script:

- detects the local OS and architecture
- downloads the matching release asset
- installs the bundle under `~/.local/share/ccc/releases/<version-platform>`
- points `~/.local/share/ccc/current` at that bundle
- links `ccc` into `~/.local/bin`
- runs `ccc setup`
- runs `ccc check-install`

The installer's own `check-install` run is only an immediate self-check.
For the real post-install verification path, fully exit Codex CLI, start a new Codex CLI session, and then run:

```bash
ccc check-install
```

## Manual Install

1. download and unpack the release bundle for your platform
2. from the unpacked directory, run:

```bash
./bin/ccc setup
```

3. fully exit Codex CLI
4. start a new Codex CLI session
5. run:

```bash
./bin/ccc check-install
```

## Installer Variables

The installer supports these optional environment variables:

- `CCC_VERSION`: release tag to install, defaults to `v0.0.2`
- `CCC_INSTALL_ROOT`: install root, defaults to `~/.local/share/ccc`
- `CCC_BIN_DIR`: directory for the `ccc` symlink, defaults to `~/.local/bin`
- `CCC_DOWNLOAD_URL`: explicit asset URL override, useful for local testing

## Healthy Check

`ccc check-install` should report:

```text
CCC install check: status=ok version=0.0.2 entry=$cap registration=matching_registration config=present skill=matching_install
```

## What Setup Does

- registers or refreshes the `ccc` MCP entry in Codex CLI
- creates `~/.config/foreman/ccc-config.toml` on first install using the canonical shared-config format
- reuses the existing `~/.config/foreman/ccc-config.toml` when it is already present
- migrates legacy `~/.config/foreman/foreman-config.toml` when present
- migrates legacy `~/.config/foreman/foreman-config.json` when present
- installs or refreshes the public `$cap` skill under `CODEX_HOME`
- syncs CCC-managed Codex custom agents under `CODEX_HOME/agents`

The generated shared TOML config includes the default per-role `model`, reasoning tier (`variant`), `fast_mode`, and `config_entries` values. Runtime dispatch reads those values from `ccc-config.toml` when it launches delegated `codex exec` work, rather than hardcoding model or reasoning choices in the installer flow.

The public `$cap` skill and generated custom-agent prompts are intentionally compact. Ordinary captain loops should use `compact=true` CLI payloads and the short `subagent_contract` surface rather than repeatedly loading full run or delegation-plan JSON.

For the public `$cap` path, `0.0.2` keeps explicit captain-first entry as canonical. Ordinary `$cap` work should start with an explicit bounded CCC run, let `Way` create a `LongWay`, and then let captain select and reassign specialists one at a time inside the same run. `ccc_auto_entry` remains available for compatibility and diagnostics, but it is no longer the default public `$cap` front door.

`0.0.2` also makes generic companion tool routing real at runtime. When the routing policy in `ccc-config.toml` selects a companion owner, lightweight filesystem/docs/fetch/git inspection work is delegated to `companion_reader`, and git mutation work is delegated to `companion_operator`, using the configured mini-model profile during the actual worker launch.

`0.0.2` also adds lane-aware raider fan-out/fan-in V1. Stable lanes are `raider-a` through `raider-d`; the default fan-out is 2 lanes only for explicit disjoint parallel work, the hard maximum is 4 lanes, and fan-in waits for every active lane before merge. `subagent-update` records `lane_id` so lane-level routing stays visible in compact lifecycle output.

Prefer `--text`, `--quiet`, and `--json-file` for lower-noise repeated lifecycle calls. Host-side token status for custom subagents is limited and best-effort only. For correlation, use `child_agent_id` for the CCC role or managed agent name and `thread_id` for the raw host Codex session/thread identifier.

## Use

After restarting Codex CLI:

```text
$cap inspect this repository and report findings only
$cap implement the scoped fix, run tests, then commit and push
```
