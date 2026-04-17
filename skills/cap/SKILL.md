---
name: cap
description: Route the current user request through the installed Codex-Foreman MCP as a captain-first Foreman task instead of answering purely through the host Codex session.
metadata:
  short-description: Captain-first Foreman entry
---

# $cap

Use this skill when the operator invokes `$cap` and wants the request handled through Foreman's captain-first path.

## Intent

- treat the operator's message, minus the literal `$cap` token, as the request that should enter Foreman first
- treat `$cap` as the user-facing trigger that hands the operator request to `captain`, not as the worker itself
- when the packaged custom-agent roster is available, treat `foreman_captain` as the first Codex-native receiver for the `$cap` request
- keep the public entry surface narrow: the operator uses `$cap`, while worker-to-worker progression stays internal to Foreman
- prefer persisted Foreman state, status, orchestration, and delegation visibility over ad hoc host-session improvisation
- treat Codex as the orchestrator that decides when to stay local, when to inspect Foreman state, when to call a specialist role, and when to verify before replying
- treat Foreman as the bounded toolbox that exposes role, model, playbook, wrapper, result-contract, run, delegation, and evidence metadata

## Required workflow

1. If no meaningful request remains after removing `$cap`, ask the operator what should enter Foreman.
2. Start from persisted Foreman state first: if a visible run or active-run candidate is relevant, prefer `mcp__codex_foreman__foreman_status`, `mcp__codex_foreman__foreman_activity`, and other run-scoped surfaces before assuming new-run creation.
3. Prefer `mcp__codex_foreman__foreman_auto_entry` for fresh work after that status-first check; let Foreman inspect active persisted runs before defaulting to a new run.
4. If `foreman_auto_entry` does not create a run because current policy still requires an explicit entry call, use `mcp__codex_foreman__foreman_recommend_entry` and then enter through the matching explicit Foreman tool.
5. Treat `captain` as the first Foreman receiver for work that entered through this skill. When the packaged custom-agent roster is installed, prefer the Codex-native `foreman_captain` custom agent as that first receiver.
6. Use `mcp__codex_foreman__foreman_status`, `mcp__codex_foreman__foreman_activity`, `mcp__codex_foreman__foreman_orchestrate`, and delegation visibility surfaces to keep the run inspectable.
7. Keep worker routing internal. Do not tell the operator to invoke separate public worker skills or slash commands. If internal worker delegation is needed and the packaged custom-agent roster is present, prefer these Codex-native custom agents:
   - `foreman_tactician` for planning
   - `foreman_scout` for exploration
   - `foreman_raider` for implementation
   - `foreman_arbiter` for review
   - `foreman_sentinel` for ownership classification
8. When specialist metadata is available, treat `agent-skills` as the role playbook layer and the Foreman wrapper docs as the thin adapter layer. Do not describe this as hidden Codex CLI interception.

## Captain-directed loop

- the common review path is `captain -> assigned agent -> arbiter -> captain`
- the actual loop is not fixed; `captain` may continue, reroute, request another bounded pass, hold for operator input, or synthesize the final response
- when review is needed, keep it visible through Foreman state instead of inventing a parallel public worker command surface

## Notes

- `$cap` depends on the installed `codex-foreman` MCP and the packaged local skill directory
- the packaged install surface may also ship matching Codex custom-agent files for internal harness routing, but `$cap` remains the only public operator entrypoint
- those custom agents or subagents are bounded specialist executors that Codex chooses deliberately; they are not hidden always-on workers
- packaged role metadata may also expose mapped playbook bundles and wrapper docs for planner, explorer, code specialist, and verifier; those are internal specialist contracts, not public operator commands
- upstream lifecycle commands such as `/spec`, `/plan`, `/build`, `/test`, `/review`, and `/ship` are playbook inspiration only here, not the public Codex-Foreman operator surface
- if the packaged custom-agent roster is unavailable, stay on the persisted Foreman MCP path rather than inventing a public worker command surface
- when the operator asks for commit, push, or release work without a stricter commit plan, default to small split commits grouped by coherent work type and use `<type>: <summary>` commit titles
- new or updated skill content requires a fresh Codex session before the change is available
