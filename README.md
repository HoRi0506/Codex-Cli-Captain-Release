# codex-foreman

Captain-first workflow for Codex CLI.

Codex-Foreman lets you send a request into a Foreman-managed path before it falls back to the host Codex session. The main entrypoint is `$cap`, which hands the request to `captain` first.

## What Captain Does

`captain` is the orchestrator. It receives the request, decides whether to continue an existing run or start a new one, breaks work into bounded steps, chooses the right agent role for the next task, and pulls the result back into one visible Foreman run.

## How It Works

- you send a request with `$cap <request>`
- `captain` reads the request and the current Foreman state
- when the packaged custom-agent roster is available, `$cap` hands the Codex-side request to `foreman_captain` first
- Foreman routes work to role-shaped agents such as planning, exploration, execution, or review
- results flow back through `captain`, which decides whether to continue, reroute, review, or answer

## Packaged Harness Surface

The packaged install surface now ships:

- the public `$cap` skill
- a matching Foreman custom-agent roster for Codex-native harness work
- a plugin-era manifest skeleton and MCP placeholder that keep the package aligned with supported Codex extension surfaces

The current supported activation path is still `codex-foreman setup`, which installs the skill and custom-agent roster and registers the MCP entrypoint.
The first Codex-native receiver for packaged `$cap` work is `foreman_captain` when that custom-agent roster is available.

## Install

Copy this text into Codex CLI:

```text
Install codex-foreman on this machine from the GitHub release tarball https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.5.4/codex-foreman-1.5.4.tgz. Do not assume a published npm registry package exists. If this repository is available locally, read `docs/install.md` before you start and follow it as the source of truth. Run `codex-foreman setup`, then run `codex-foreman check-install`. Verify that `codex-foreman check-install` reports `status=ok`, that the packaged `$cap` skill is installed, and that the packaged Codex custom agents are installed. Do not ask me to type the shell commands manually. Execute them yourself and finish with exactly: Please restart Codex CLI.
```

## What To Expect

- a more structured entry path for requests that need orchestration
- visible run state instead of one opaque turn of work
- a captain-led loop that can hand work off and bring it back
- room for planning and review before the final answer is synthesized

## Agent Roles

- `captain` leads orchestration
- planning agents shape and scope work
- exploration agents inspect state and gather bounded evidence
- execution agents handle implementation work
- review agents check results before they return to `captain`
- ownership helpers classify whether the visible execution path still looks Foreman-managed

## Quick Start

After install and restart:

- use `$cap <your request>` when you want the request to enter Foreman through `captain`
- use `codex-foreman check-install` when you want to confirm the install is healthy
- restart Codex CLI after install or update so the latest MCP session and skill are loaded

Codex authentication remains on supported Codex login paths. Foreman does not proxy or scrape OAuth credentials.

## Config

The shared editable config stays here:

- `$XDG_CONFIG_HOME/foreman/foreman-config.json`
- `~/.config/foreman/foreman-config.json`

`codex-foreman setup` is the primary supported path for creating or reusing that file after install. The shipped bootstrap helper remains available as a manual fallback instead of hiding config inside repository-local state.

## Notes

- This repository is for install and execution, not source development.
- Managed install-surface files may be replaced by the next export run from the source repository.
