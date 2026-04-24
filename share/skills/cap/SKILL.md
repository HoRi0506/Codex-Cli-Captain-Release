---
name: cap
description: Enter the current user request through Codex-Cli-Captain so host Codex runs the 0.0.4 captain-first LongWay loop instead of answering locally.
metadata:
  short-description: Captain LongWay loop entry
---

# $cap

Use when the operator invokes `$cap`. Remove the literal `$cap` token and route the remaining request through CCC.

## Model

Public flow: `captain -> Way -> captain -> specialist -> captain -> ... -> end`.

- Host Codex is the public `captain`.
- CCC owns persisted LongWay, task-cards, routing, visibility, and fallback truth.
- Specialists are internal executors selected from `ccc-config.toml`.
- Prefer Codex custom subagents over detached `codex exec`; keep `codex exec` as explicit fallback only.
- `/agent` is inspection/thread switching only, not the orchestrator.
- Do not let one specialist hand off directly to another; always return to captain.
- Host Codex as captain owns LongWay, routing, lifecycle, fan-in, review, validation, and commit boundaries. For ordinary `$cap` work, route read-only investigation to `ccc_scout`, docs/operator text to `ccc_scribe`, code/config mutation to `ccc_raider`, and review judgment to `ccc_arbiter` via custom subagents when available. Direct captain edits/work are fallback only, trivial operator-side fixes, or recorded CCC degradation.
- For ordinary `$cap` mutation/rewrite work, route through CCC specialists first: docs/operator text -> `ccc_scribe`, code/config mutation -> `ccc_raider`, read-only evidence -> `ccc_scout`, review judgment -> `ccc_arbiter`.
- For ordinary `$cap`, do not call `mcp__ccc__...` tools. Use the local `ccc` CLI; MCP is diagnostics-only unless the operator asks for it.

## Active Requests

When a new `$cap` request arrives while an earlier run or subagent is still active, CCC surfaces the active run and recommends merge, replan, or reclaim handling.

Host custom subagents cannot always be forcibly canceled by CCC, so captain should mark stale work as reclaimed or merged and continue from the combined latest request.

If the operator intervenes while a subagent is active, route the request only through captain. Record the intervention as a bounded delta plus rationale in LongWay/task-card state, classify it as clarification-only, bounded scope amendment, or direction/risk correction, and choose exactly one action: same-worker amend if safe, reclaim if forced interruption is unsupported or scope changed materially, or reassignment to a better-fit specialist. Keep stale output visible and do not let it overwrite the chosen path unless captain explicitly merges it. Use the same bounded retry/reassign budget as dissatisfaction repair, with no unlimited amend loops, scope widening without explicit replan or re-scope, or duplicate mutable workers just for intervention.

## Compact Loop

Use compact CLI surfaces by default. Full JSON/status is debug-only.

1. Ensure a meaningful request remains after `$cap`; otherwise ask one concise clarification.
2. Verify workspace write support once with `test -w .`.
3. If not writable, state CCC needs workspace-write, then stop or do one visible read-only fallback if the request is read-only.
4. Start with one bounded Way checkpoint using low-noise lifecycle output:
   `ccc start --quiet --json '{"prompt":"<request>","title":"<short>","intent":"<short>","goal":"<short>","scope":"<bounded>","acceptance":"<done when>","task_kind":"way","compact":true}'`
5. For decisions, use:
   `ccc status --text --json '{"run_id":"<run_id>"}'`
   - quiet lifecycle lines (`start` / `orchestrate` / `subagent-update` / `status`) already include compact token usage fields or explicit unavailable reason fields when raw usage events exist; prefer those over ad-hoc token guesses.
6. Use `command_templates` from compact status. Do not run `ccc ... --help`, broad `rg`, or session-history searches to discover syntax.
7. If `preferred_specialist_execution_mode=codex_subagent` and a custom agent is available, use that subagent first.
8. Follow `subagent_spawn_contract`: use the named custom agent, avoid full-history fork, and omit agent/model/reasoning overrides already defined by the custom agent.
9. Record lifecycle with CLI, not MCP, when requested:
   `ccc subagent-update --quiet --json '{...,"compact":true}'`
   - Set `child_agent_id` to the CCC custom agent name from contract (`ccc_raider`, `ccc_tactician`, `ccc_scout`, etc.), not to raw host session identifiers.
   - Put raw host agent/session identifiers in `thread_id` when useful for correlation.
   - Do not claim CCC can control host Codex `/agent` Spawned/Waiting row labels.
10. Required lifecycle order: `spawned -> completed|failed|stalled -> merged`.
11. Subagent fan-in must be compact structured data: `summary`, `status`, `evidence_paths`, `next_action`, `open_questions`, `confidence`. If a subagent result is unsatisfactory, record the rationale and next action, keep the prior result visible, and send only one bounded repair or reassignment with a narrowed prompt.
12. If `codex_exec_fallback_allowed=false`, do not call `ccc orchestrate` as fallback for that task-card until a terminal subagent update or explicit `fallback_reason` is recorded.
13. Replan/resolve through compact orchestrate templates:
   `ccc orchestrate --quiet --json '{...,"compact":true}'`
14. Prefer `--json-file` for repeated lifecycle payloads to avoid shell-quoted raw JSON noise.
15. Reply only when complete, blocked, or waiting on a real operator decision. Do not print the final answer twice.

## Routing

Use CCC-managed custom agents when available:

- `ccc_tactician`: Way/planning
- `ccc_scout`: read-only repo/workspace evidence
- `ccc_raider`: bounded code/config mutation
- `ccc_scribe`: docs/operator text
- `ccc_arbiter`: optional risk/acceptance review
- `ccc_sentinel`: ownership/path classification
- `ccc_companion_reader`: lightweight read-only tool-routed work
- `ccc_companion_operator`: lightweight mutation/operator-side work

Do not route to generic helper agents when a matching CCC specialist exists.
Captain owns LongWay updates, lifecycle recording, fan-in, validation, and commit boundaries. Direct captain edits are fallback only or genuinely trivial operator-side fixes.

## Parallel Lanes

- scout lanes default to 2 read-only lanes when broad or parallel investigation is useful, with a max of 4
- raider lanes default to 2 lanes for broad or multi-file mutation, with a max of 4
- single-file or shared-scope mutation stays sequential

## Token Visibility

`ccc status --text` prints token totals and a stacked gauge only when raw delegated-worker usage events are available. When those events are missing, CCC prints an explicit unavailable reason instead of guessing totals.

## Discipline

- Keep captain messages short; do not paste full CCC JSON into public updates.
- Use `ccc activity` only for diagnostics when compact status lacks necessary truth.
- Avoid broad host-local repo inspection unless CCC visibly degrades.
- Mutation/review work belongs to specialists, not captain, unless fallback is explicit.
- On stalls, prefer CCC reclaim/retry/reassign before degraded host-local fallback.
- `arbiter` is optional; use it only for real risk, ambiguity, failed tests, or release-critical judgment.
- Stored LongWay text should stay English; answer the operator in their language.
- If the operator references external file paths outside the workspace, keep those exact paths in scope when sandbox-readable; if blocked, return the exact blocked path and required approval instead of broad "workspace-only" wording.
