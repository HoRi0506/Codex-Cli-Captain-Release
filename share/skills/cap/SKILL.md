---
name: cap
description: Enter the current user request through the installed Codex-Cli-Captain MCP so host Codex/captain can run the 0.0.2 LongWay loop instead of answering purely through the host session.
metadata:
  short-description: Captain LongWay loop entry
---

# $cap

Use this skill when the operator invokes `$cap` and wants host Codex/captain to route the request through CCC.

## Canonical model

The intended public model is:

1. `captain`
2. `Way(LongWay creation)`
3. `captain(LongWay review)`
4. `agent 1`
5. `captain(LongWay update)`
6. `agent 2`
7. `captain(LongWay update)`
8. `captain end`

Do not present `$cap` as a fixed phase chain.

Do not let one specialist hand off directly to the next specialist without a captain checkpoint in between.

Do not treat `$cap` as a hidden worker command surface. The host Codex session acting as `captain` is the public receiver for this skill; the packaged CCC specialists are internal executors.

## Core rules

- Treat the operator's message, minus the literal `$cap` token, as the request that should enter CCC.
- Use the current Codex session as the public request boundary; persisted CCC runs are internal execution state.
- The public `$cap` path is explicit captain-first entry, not auto-entry-first.
- For ordinary `$cap` work, prefer the local `ccc` CLI JSON commands over direct `mcp__ccc__...` tool calls from the host session.
- Do not make `ccc_auto_entry` a required front door for ordinary `$cap` work.
- Use `ccc_auto_entry` only for compatibility checks, diagnostics, or when the operator explicitly asks to test the automatic entry surface.
- Before creating a CCC run, check whether the current workspace is writable. If it is read-only, do not retry the same CCC start path again in that session.
- Canonical persisted LongWay text must be English.
- If the operator asks about LongWay status, translate or summarize it in the operator's language at response time without rewriting the stored LongWay text.
- In normal operation, `captain` does not directly edit code or docs.
- Actual work should be done by the selected specialist agent.
- Delegated specialists must run with the role settings from `ccc-config.toml`; model, reasoning tier, fast mode, and config overrides come from the shared role config, not from hardcoded `$cap` choices.
- Way or captain should also set the worker sandbox once per task-card. Read-only work should launch as `read-only`; mutation work should launch as `workspace-write`.
- Only allow `captain` direct mutation when CCC cannot launch the specialist path honestly, bounded reclaim and one explicit captain retry already failed, or the operator explicitly approves a host-local fallback.

## Visibility contract

Prefer the `LongWay` wording over the older checklist or phase wording.

When CCC exposes compact runtime truth, keep the operator update anchored to lines like:

- `LongWay: 1/3 completed`
- `Tokens: 10.5k used`
- `[████████████████ ███████ ███]`
- `By Agent: raider 72% (7.6k) | captain 28% (2.9k)`
- `Current Item: item-2`
- `Agent Loop: CCC launched scribe [gpt-5.4-mini/medium]`
- `Spawned: scribe`
- `Changed: captain marked item-1 completed`
- `Next: raider`

Do not invent or prefer `Phase Chain: ...` wording when the `LongWay` wording is available.

Surface `Spawned:` when a worker starts and `Changed:` when captain updates the LongWay or the next action changes materially.
When `ccc_status` exposes `token_usage`, every captain LongWay block is expected to include a `Tokens:` line in that same LongWay block instead of hiding token visibility in a separate CCC status dump.
Do not omit the `Tokens:` line from the LongWay block just because the value did not change on the latest poll.
The operator's quiet-mode suppression applies only to raw transport traces such as `mcp: ccc/ccc_status ...` or `exec: ccc status --json ...`; it does not apply to the public captain LongWay block.

When `token_usage.by_agent` is available, prefer the full visual form instead of a bare number-only token line:

- Keep the first line as `Tokens: 10.5k used`.
- Add a dedicated stacked usage bar line immediately under `Tokens:`, such as `[████████████████ ███████ ███]`.
- Use contiguous `█` segments in descending share order and separate agent boundaries with single spaces.
- Add a `By Agent:` line immediately under the bar line.
- Preserve the per-agent percentage and token count on that line.

Prefer the LongWay block order:

- `LongWay: ...`
- `Tokens: ...` when available
- `[████ ...]` when `token_usage.by_agent` is available
- `By Agent: ...` when `token_usage.by_agent` is available
- `Current Item: ...`
- `Agent Loop:` or `Spawned:` when materially useful
- `Changed:` when captain updated LongWay state
- `Next: ...`

## Token discipline

- Prefer `ccc status --json '{...}'` first and use `ccc activity --json '{...}'` only when status is insufficient for the next decision.
- Treat `ccc activity` as a diagnostics-only fallback. Do not call both `status` and `activity` at the same boundary unless the missing field is necessary for the next captain decision.
- Before emitting a captain LongWay block, refresh or reuse the latest `ccc status` truth and carry `token_usage` into the block whenever it is available.
- Do not spend host-local tokens on mutation, review, or broad repository inspection when a matching CCC specialist path exists.
- Do not perform broad host-local workspace inspection just to answer a `$cap` request unless CCC has already degraded visibly.
- If status shows `next_step=await_fan_in` with `can_advance=true` or `run_truth_surface.resume_action=advance`, treat that as a resumable CCC boundary and call the bounded advance path; do not classify it as a degraded stall.
- If status shows `reclaim_plan.reclaim_needed_worker_count > 0` or a worker timeout or reclaim boundary, call the bounded CCC reclaim path before considering host-local fallback.
- After launching a worker, do not immediately issue another `ccc status` or `ccc activity` poll just to restate the same checkpoint. Poll only when you need new truth for the next captain move or the next public LongWay block.
- Once a visible degraded host-local fallback begins, stop additional CCC polling unless you need one final bounded resolve call.
- Do not repeat unchanged visibility lines on every poll, except that `Tokens:` should still be repeated on each public captain LongWay block when `token_usage` is available.

## Required workflow

1. If no meaningful request remains after removing `$cap`, ask what should enter CCC.
2. Before a fresh CCC run, verify the workspace is writable with a minimal check such as `test -w .`.
3. If that check fails, do not bounce between `ccc start` and `mcp__ccc__...` retries. State once that CCC needs workspace-write to persist the LongWay, then either wait for the operator to rerun under a writable sandbox or perform one visible read-only fallback if the request is genuinely read-only.
4. For a fresh request under a writable workspace, use `ccc start --json '{...}'` as the default public entry.
5. For the ordinary public loop, start with a captain-first Way run:
   Set the scope to one bounded Way checkpoint.
   Set `task_kind=way` when the next specialist is not yet obvious.
   Use the smallest truthful bounded scope instead of an unbounded chain drain.
6. After start, read `ccc status --json '{...}'` before deciding the next move.
7. Launch at most one bounded specialist step at a time with `ccc orchestrate --json '{...}'`.
8. After each specialist result, return to a captain checkpoint before materializing the next specialist.
9. When captain needs a different next specialist in the same run, call `ccc orchestrate --json '{...}'` with:
   `repair_action`: the role hint or agent hint such as `tactician`, `scout`, `raider`, `scribe`, `arbiter`, `companion_reader`, `companion_operator`, or `retry_current_specialist`
   `replan_prompt`: the exact bounded next task for that specialist
   Optional `resolve_summary`: a short captain summary for the next LongWay item title
10. If the run is currently at `await_fan_in`, prefer a single `ccc orchestrate --json '{...}'` call that collapses fan-in and applies `repair_action` plus `replan_prompt` or `resolve_outcome` in the same call.
11. After a replan call that returns `next_step=execute_task`, run one bounded `ccc orchestrate --json '{...}'` call to launch the selected specialist. Read `ccc status --json '{...}'` again only when captain needs refreshed truth for the next operator-facing LongWay block or the next decision.
12. Do not let the host session bounce directly from `agent -> next agent` without a captain LongWay update.
13. Do not default to `progression_mode=drain_until_boundary` for ordinary `$cap` work. Use bounded single-step progression so captain can inspect the result and update the LongWay between specialist passes.
14. If a worker stalls, let CCC reclaim it first. Only after reclaim and an explicit captain retry or reassignment fail should the host consider a visible degraded fallback.
15. To close the loop honestly, have captain call `ccc orchestrate --json '{...}'` with `resolve_outcome` and `resolve_summary` when acceptance is met, blocked, failed, or cancelled. If the run is still at `await_fan_in`, prefer the combined collapse plus resolve call instead of a separate collapse poll.
16. Reply to the operator only when the request is complete, explicitly blocked, or waiting on a real operator decision.

## Specialist selection

Use the packaged CCC specialist roster deliberately.

- `ccc_tactician`: Way creation when the next bounded move is still ambiguous
- `ccc_scout`: read-only evidence gathering, repository inspection, or diagnosis
- `ccc_raider`: bounded code or config mutation
- `ccc_scribe`: bounded docs, README, release-note, or operator-guidance writing
- `ccc_arbiter`: optional review or pass or needs_work or blocked judgment when risk or ambiguity justifies it
- `ccc_sentinel`: ownership or execution-path classification only
- `ccc_companion_reader`: tool-routed lightweight read-only work such as filesystem, docs, or fetch-backed evidence gathering when the routing policy selects the companion reader
- `ccc_companion_operator`: tool-routed lightweight mutation or operator-side work such as git-backed actions when the routing policy selects the companion operator

Do not route to generic Codex helper agents when a matching packaged CCC specialist is available.

Do not satisfy that role by routing to generic Codex `explorer` or `worker` agents or to unrelated MCP servers instead.

## Review policy

`arbiter` is optional, not a mandatory fixed stage.

- Let `captain` close straightforward bounded work directly when the LongWay acceptance is clearly satisfied.
- Add `arbiter` only when risk, ambiguity, failed tests, or release-critical judgment justifies a verifier pass.
- If review finds `needs_work`, return to captain, update the LongWay, and choose the next bounded repair agent.

## Repair policy

Be conservative.

- If acceptance is not met, captain should mark the LongWay item `needs_work`.
- The next action should be another bounded specialist pass, not an unbounded chain drain.
- Keep repair loops bounded.
- After a stuck worker, prefer reclaim and explicit reassignment before any host-local fallback.
- If bounded reclaim and bounded retry are exhausted, surface a manual boundary or a visible degraded truth instead of pretending the request completed.

## Notes

- `$cap` depends on the installed `ccc` MCP and the packaged local skill directory.
- The preferred host transport for the public `$cap` loop is the local `ccc` CLI JSON surface; it reuses the same runtime logic without depending on fresh-session MCP tool calls.
- Packaged skill updates require a fresh Codex session before the new behavior is visible.
- The packaged run session can still be cleared explicitly with `$cap close current run` or `$cap clear run session`.
- `$cap` remains the only public CCC harness entrypoint; the internal specialist roster is not a public command surface.
- `ccc_auto_entry` still exists for compatibility and diagnostics, but it is no longer the default public `$cap` entry path for `0.0.2`.
