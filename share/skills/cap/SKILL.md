---
name: cap
description: Enter the current user request through Codex-Cli-Captain so host Codex runs the 0.0.4 captain-first LongWay loop instead of answering locally.
metadata:
  short-description: Captain LongWay loop entry
---

# $cap

Use when the operator invokes `$cap`. Remove the literal token and route the remaining request through CCC.

## Model

Flow: `captain -> Way -> captain -> specialist -> captain -> ... -> end`.

- Host Codex is the public `captain`.
- CCC owns persisted LongWay, task-cards, routing, visibility, and fallback truth.
- Specialists are internal executors selected from `ccc-config.toml`.
- Prefer Codex custom subagents over detached `codex exec`; keep `codex exec` as explicit fallback only.
- `/agent` is inspection/thread switching only, not the orchestrator.
- Do not let one specialist hand off directly to another; always return to captain.
- Captain owns LongWay, routing, lifecycle, fan-in, review, validation, and commit boundaries. Route ordinary read-only work to `ccc_scout`, docs to `ccc_scribe`, code/config mutation to `ccc_raider`, and review to `ccc_arbiter`; direct captain work is fallback/trivial/degraded only.
- For ordinary `$cap`, do not call `mcp__ccc__...` tools. Use the local `ccc` CLI; MCP is diagnostics-only unless the operator asks for it.

## Active Requests

When a new `$cap` request arrives while an earlier run/subagent is active, CCC surfaces it and recommends merge, replan, or reclaim. Host subagents cannot always be forcibly canceled, so mark stale work as reclaimed/merged and continue from the combined latest request.

If the operator intervenes while a subagent is active, route only through captain. Record bounded delta/rationale, classify it, and choose one action: same-worker amend, reclaim, or reassignment. Keep stale output visible and never let it overwrite the chosen path unless captain explicitly merges it.

If the host shows file-descriptor pressure such as `Too many open files (os error 24)`, open no more reviewers/specialists. Record terminal state through `ccc subagent-update`, close spawned host agents, and continue single-path.

## Compact Loop

Use compact CLI surfaces. Full JSON/status is debug-only.

1. Ensure a meaningful request remains after `$cap`; otherwise ask one concise clarification.
2. Verify workspace write support once with `test -w .`.
3. If not writable, state CCC needs workspace-write, then stop or do one visible read-only fallback if the request is read-only.
4. Start with one bounded Way checkpoint using low-noise lifecycle output:
   `ccc start --quiet --json '{"prompt":"<request>","title":"<short>","intent":"<short>","goal":"<short>","scope":"<bounded>","acceptance":"<done when>","task_kind":"way","compact":true}'`
5. For decisions, use:
   `ccc status --text --json '{"run_id":"<run_id>"}'`
   - quiet lifecycle lines (`start` / `orchestrate` / `subagent-update` / `status`) already include compact token usage fields or explicit unavailable reason fields; structured status/activity also exposes `token_usage_visibility.status` and `token_usage_visibility.unavailable_reason_code`; prefer those over ad-hoc token guesses.
6. Use `command_templates` from compact status; avoid `ccc ... --help`, broad `rg`, or history searches for syntax.
7. If `preferred_specialist_execution_mode=codex_subagent` and a custom agent is available, use that subagent first.
8. Follow `subagent_spawn_contract`: use the named custom agent, avoid full-history fork, and omit agent/model/reasoning overrides already defined by the custom agent.
9. Record lifecycle with CLI, not MCP, when requested:
   `ccc subagent-update --quiet --json '{...,"compact":true}'`
   - Set `child_agent_id` to the CCC custom agent name from contract (`ccc_raider`, `ccc_tactician`, `ccc_scout`, etc.), not to raw host session identifiers.
   - Put raw host agent/session identifiers in `thread_id` when useful for correlation.
   - Do not claim CCC can control host Codex `/agent` Spawned/Waiting row labels.
10. Required lifecycle order: `spawned -> completed|failed|stalled -> merged`.
11. Fan-in must be compact structured data: `summary`, `status`, `evidence_paths`, `next_action`, `open_questions`, `confidence`. If unsatisfactory, record rationale/next action and send only one narrowed repair or reassignment.
12. After each spawned host agent reaches terminal fan-in, close that host agent before opening another one. This is mandatory under `os error 24` or other file-handle pressure.
13. If `codex_exec_fallback_allowed=false`, do not call `ccc orchestrate` as fallback for that task-card until a terminal subagent update or explicit `fallback_reason` is recorded.
14. Replan/resolve through compact orchestrate templates:
   `ccc orchestrate --quiet --json '{...,"compact":true}'`
15. For document/checklist-backed finish/continue/"끝까지" requests, treat the referenced document as completion criteria. Iterate until every in-scope item is completed, explicitly deferred, or blocked; a first slice is not complete.
16. Prefer `--json-file` for repeated lifecycle payloads to avoid shell-quoted raw JSON noise.
17. Reply only when complete, blocked, or waiting on a real operator decision. Do not print the final answer twice.

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

When routing trace selects a route-backed companion owner, keep the work out of the captain session unless a fallback/degradation reason is recorded. Git and `gh` reads belong to `ccc_companion_reader`; git and `gh` mutations belong to `ccc_companion_operator`.

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
- When a request is backed by a release note, plan, checklist, or `.md` file and asks to finish the work, derive the remaining checklist from that source and continue through CCC until the documented completion criteria are satisfied, explicitly out of scope, or blocked.
