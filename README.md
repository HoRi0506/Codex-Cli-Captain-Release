# codex-foreman

Captain-first Foreman toolbox for Codex CLI.

Codex-Foreman is for requests that benefit from a more structured path than one opaque Codex turn. It adds a captain-first entry, visible run state, role-shaped specialist routing, an explicit review lane, and honest install/runtime audit without replacing the host Codex session as the orchestrator.

Beta warning: this release surface is still beta. Expect changes, fixes, and update cadence to stay relatively fast and sometimes irregular while the harness contract continues to harden.

Install warning: beta releases are distributed through GitHub Release tarballs from this install-only release repository. The public npm registry is not the supported install surface for the beta train.

The public entrypoint is `$cap`. That entry keeps the host Codex session as `captain` first.

## What It Is For

Use Codex-Foreman when you want one or more of these:

- a captain-led intake before work begins
- visible run, delegation, and fallback state
- derived navigation bundles that captain, tactician, and scout can use as bounded read-first aids
- role-shaped planning, exploration, implementation, or review
- routing that explains whether the current bounded path is light, medium, or heavy and why
- install diagnostics that expose configured role-model policy and active-run hygiene
- a bounded path that can stop, reroute, review, or continue instead of flattening everything into one response
- clearer proof about whether work stayed local or used a configured specialist path

It is most useful for multi-step work, repository investigation, scoped implementation, verification-sensitive tasks, and any request where you want the path of work to stay inspectable.

It is also useful when you want read-heavy repository questions, doc lookups, or bounded explanation work to stay on a cheaper scout-first path unless mutation is explicitly requested.

For trivial answers or short conversational turns, the normal Codex path is often enough.

## What Captain Does

`captain` is the orchestrator. For packaged `$cap`, that means the host Codex session receives the request first, checks the current Foreman state, decides whether to stay narrow or choose a specialist role, keeps the work bounded, and pulls the result back into one visible run.

The packaged routing pass is request-shape-aware before it becomes mutation-shaped. Existence checks, lookup, survey, diagnosis, planning, verification, and synthesis can stay on cheaper `captain`, `scout`, or `tactician` routes, while `raider` stays behind an explicit mutation-intent gate.

Token discipline matters here. Captain should spend tokens on state lookup, routing, waiting, and synthesis rather than broad repository survey or specialist-grade mutation work that can be delegated under role-specific settings.

For `$cap` / MCP session entry, auto-entry is fresh-run-first. Each new operator request opens a new session-owned run and closes the previous session-bound run instead of silently reusing it or queueing the request as hidden follow-up input. Codex should use the live conversation to summarize context such as "fix the issue you just found" into the new request text before sending it through Foreman.

Run reuse is now explicit on the session path. Foreman reuses the current session-bound run only when the operator asks to continue or resume the current run, or when the identical request is already in flight and the second call would duplicate the same work. Detached `codex-foreman auto-entry` without a requester session can still use workspace active-run search for bounded CLI reuse decisions.

Default operator views now prefer named roster labels such as `captain`, `scout`, `raider`, and `arbiter` over opaque worker ids, and the compact answer trace explains request shape, selected role, execution path, and why a heavier specialist route did or did not win.

The MCP auto-entry surface can now report bounded elapsed timing as part of the operator-facing diagnostic path, which makes it easier to tell whether slowdown came from Foreman work itself or from outer session transport.

`codex-foreman status --run-id <id>` is the one-shot CLI snapshot surface for that same truth. It uses the compact watch contract without the polling mental model and can show the latest answer path separately from the persisted current task when a reused implementation run receives a read-only follow-up. The same compact surface can also show route progress and session-workstream summary when those truths matter for the current run.

## How It Behaves

- you send a request with `$cap <request>`
- `captain` reads the request and current Foreman state
- `captain` chooses the next bounded loop stage and path variant before specialist routing
- Codex decides whether to answer locally or use a specialist role inside that bounded stage
- Foreman provides the run state, role metadata, model policy, playbook mapping, wrapper contract, and evidence surfaces
- the routing surface can explain workload class, path weight, model-tier budget, reasoning-effort budget, and review requirement for the current bounded route
- the answer trace can explain request shape, selected role, execution path, and why a heavier specialist path did or did not win
- `codex-foreman status --run-id <id>` can show the latest answer path separately from the persisted current task when those truths differ
- read-heavy repository questions can stay on a cheaper scout-first path instead of silently normalizing into heavy implementation routing
- `$cap` / MCP session auto-entry creates one fresh session-owned run per new operator request
- explicit continue/resume requests can still reuse the current session-bound run
- detached `codex-foreman auto-entry` remains on the workspace-run search path for bounded CLI reuse decisions
- `codex-foreman check-install` can also report configured role-model policy and whether run buildup is making auto-entry reuse ambiguous
- when a bundled directory is named clearly enough, planner and scout prompts can inherit a compact non-canonical navigation hint instead of starting cold
- the packaged `$cap` skill keeps the host Codex session as `captain`, while packaged custom agents remain internal specialist targets
- specialist results return through `captain`, which decides whether to continue, review, reroute, stop, or answer

## Canonical Loop

The default bounded loop is:

`intake -> scoped -> investigating -> implementing -> reviewing -> verifying_execution_truth -> synthesizing -> completed`

The main shorter variants are:

- `light`
- `investigate_only`
- `implementation`
- `verify_only`
- `blocked_manual`

Packaged status and activity surfaces expose loop stage and path variant so the current bounded path stays visible.

## Public And Internal Boundary

The public harness surface is:

- `$cap`

The internal support surfaces are:

- the packaged custom-agent roster
- the role wrappers and playbook mappings
- the bounded review and ownership helpers

Those internal pieces help `captain` route and supervise work. They are not public operator commands.

A packaged `foreman_captain` definition may still exist as an internal or future-facing support surface, but it is not the public first receiver for packaged `$cap`.

## When To Reach For It

Reach for Codex-Foreman when:

- you want `captain` to inspect the request before execution begins
- you want planning, exploration, implementation, and review to stay visible as one run
- you care which role and model were selected
- you want bounded fallback behavior instead of silent drift
- you want bounded repo investigation to start from a cheap derived map instead of a full cold scan

## Recommended MCPs

- `context7` for current library and framework docs before planning or implementation
- `filesystem` for bounded repository inspection when the client exposes filesystem MCP tools
- `git` for provenance, diffs, branch state, and regression-oriented history checks
- `fetch` for authoritative remote artifacts or docs during release and install work

These remain companion tools under configured specialist ownership, not public worker routes.

`v1.5.39` keeps that ownership split explicit and adds the `$cap` route-selection contract:

- `git` read work such as status, diff, log, and release provenance routes to `companion_reader`
- `git` mutation work such as add, commit, push, tag, and release asset publication routes to `companion_operator`
- `filesystem`, `context7`, `fetch`, and `openaiDeveloperDocs` read/reference work routes to `companion_reader`
- route-selected companion MCPs are explicitly enabled in the dispatched worker `codex exec` args while unselected internal MCPs remain disabled
- direct host-side companion MCP calls should be surfaced as `visible_degraded_host_fallback`, not as silent Foreman-owned execution
- `$cap` captain must select the hidden Foreman route before specialist work begins and must keep route completion tied to worker launch, role/model match, mutation or evidence proof, and review/fan-in truth
- Foreman worker chains are treated as bounded sequential `codex exec` steps by default, with bounded parallelism reserved for explicit fan-out routes
- run lifecycle status exposes local retention policy so structured `.foreman` state stays canonical while markdown remains an operator summary

## Packaged Harness Surface

The packaged install surface ships:

- the public `$cap` skill
- a matching Foreman custom-agent roster for Codex-native harness work
- the captain and specialist wrapper docs that define the internal contract
- packaged declarative specialist role contracts under `schemas/`
- a plugin-era manifest skeleton and MCP placeholder that keep the package aligned with supported Codex extension surfaces

The current supported activation path is still `codex-foreman setup`, which installs the skill and custom-agent roster and registers the MCP entrypoint.

## Install

Copy this text into Codex CLI:

```text
Run these shell commands exactly in order without browsing or searching first. If one command fails, stop and report that failure.

npm install -g https://github.com/HoRi0506/Codex-Foreman-release/releases/download/v1.5.39/codex-foreman-1.5.39.tgz
codex-foreman setup
codex-foreman check-install

Verify that `codex-foreman check-install` reports `status=ok`, that the packaged `$cap` skill is installed, and that the packaged Codex custom agents are installed.
Do not ask me to type the shell commands manually.
Finish with exactly: Please restart Codex CLI.
```

## Update

To update an existing install to `v1.5.39`, copy the install block above again and rerun it. The direct tarball install refreshes the package version, and `codex-foreman setup` refreshes MCP registration plus the packaged `$cap` skill and custom agents.

If a workspace has stale persisted run buildup outside the request-scoped `$cap` flow, use `codex-foreman clear-runs --cwd /absolute/workspace/path --include-blocked` to cancel those legacy runs and print the refreshed hygiene summary.

## What To Expect

- a more structured entry path for requests that need orchestration
- visible run state instead of one opaque turn of work
- a captain-led loop that can hand work off and bring it back
- derived navigation bundles that captain, tactician, and scout can use as bounded read-first aids
- visible loop stage and path variant on status surfaces
- an active run truth surface that shows owner, selected specialist, boundary state, and resume action at a glance
- explicit specialist protocol contracts that can surface degraded validation state
- compact role framing so navigation and contract guidance stay bounded instead of bloating specialist prompts
- room for planning and review before the final answer is synthesized
- a clearer internal/public boundary for how the harness is meant to be used

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
- use `$cap close current run` or `$cap clear run session` when you want to clear the current session-bound run explicitly
- use `$cap continue current run` or `$cap resume current run` when you want to reuse the current run intentionally
- use `codex-foreman check-install` when you want to confirm the install is healthy
- restart Codex CLI after install or update so the latest MCP session and skill are loaded

Codex remains the orchestrator and authentication stays on supported Codex login paths. Foreman does not proxy or scrape OAuth credentials.

Published release assets live under https://github.com/HoRi0506/Codex-Foreman-release/releases.

## Using $cap Well

Foreman treats each fresh `$cap` request as a new request-run by default. When the next request depends on earlier conversation context, say the actual task plainly; Codex should carry the relevant context into the new Foreman request instead of reusing the older run.

Useful request shapes:

- `$cap update the release README with usage tips, then commit and push`
- `$cap investigate this new bug without changing files`
- `$cap continue the current run and review the README change before answering`
- `$cap inspect this repository and report findings only; do not edit files`
- `$cap implement this scoped fix, run the relevant tests, then commit and push`

Practical tips:

- include whether the work is read-only or allowed to mutate files
- name the target file, directory, branch, issue, or release when you know it
- assume a new run for each fresh request, and ask to continue or resume the current run only when you intentionally want the same run reused
- request review or tests explicitly when acceptance depends on them
- after setup, update, or skill changes, restart Codex CLI before relying on the new packaged behavior

## Config

The shared editable config stays here:

- `$XDG_CONFIG_HOME/foreman/foreman-config.json`
- `~/.config/foreman/foreman-config.json`

`codex-foreman setup` is the primary supported path for creating or reusing that file after install. The shipped bootstrap helper remains available as a manual fallback instead of hiding config inside repository-local state.

## Notes

- This repository is for install and execution, not source development.
- Managed install-surface files may be replaced by the next export run from the source repository.
