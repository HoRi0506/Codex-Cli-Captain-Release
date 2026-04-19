---
name: cap
description: Enter the current user request through the installed Codex-Foreman MCP so host Codex/captain can compose a phase plan from Foreman agent skill contracts instead of answering purely through the host session.
metadata:
  short-description: Captain-first Foreman entry
---

# $cap

Use this skill when the operator invokes `$cap` and wants host Codex/captain to handle the request through Foreman-backed phase composition and bounded specialist workers.

## Intent

- treat the operator's message, minus the literal `$cap` token, as the request that should enter Foreman first
- treat `$cap` as the user-facing trigger that hands the operator request to the host Codex session acting as `captain`, not as a worker itself
- do not treat `foreman_captain` as the first public receiver for `$cap`; the host Codex session is captain for this skill
- keep the public entry surface narrow: the operator uses `$cap`, while worker-to-worker progression stays internal to Foreman
- treat one `$cap` request as one captain-owned transaction that may require multiple internal Foreman specialist passes before the operator-facing answer is ready
- open a fresh Foreman run for each new `$cap` operator request; do not silently attach it to an older session-bound run
- reuse the current session-bound run only when the operator explicitly asks to continue or resume the current run, or when the identical request is already in flight
- treat the Codex session id as the request boundary for `$cap`; a persisted run is an internal Foreman artifact and evidence envelope, not the operator-facing identity anchor
- prefer persisted Foreman state, status, orchestration, and delegation visibility over ad hoc host-session improvisation
- treat Codex as the orchestrator that decides when to inspect Foreman state, when to call a specialist role, when to wait, and when to verify before replying
- treat captain's main planning action as analyzing request traits and composing a phase execution plan from Foreman agent skill contracts
- keep host-local work narrow: state lookup, request-trait analysis, phase composition, waiting, synthesis, and explicit operator-facing decisions
- treat mutation, file authoring, scoped investigation, planning, and review as specialist work that should prefer Foreman-owned execution over host-local work
- treat Foreman as the bounded toolbox that exposes role, model, playbook, wrapper, result-contract, run, delegation, and evidence metadata
- treat `foreman-config.json` plus surfaced role metadata as the model/role source of truth; do not invent role-model mappings in the skill itself

## Token discipline

- prefer `foreman_status` first and call `foreman_activity` only when status is insufficient for the next routing decision
- avoid repeating the same run-scoped visibility reads unless new work has completed or the operator asked for a fresh check
- do not spend host-local tokens searching generic workspace runs for `$cap` continuity when Foreman already has the current requester session id; prefer fresh request-scoped auto-entry and explicit continuation only
- do not perform broad host-local file survey when `scout` or `tactician` can gather the bounded evidence more cheaply
- do not spend host-local high-tier tokens on mutation or verification work that has a matching Foreman specialist path
- do not let host Codex turn read-only specialist findings directly into host-local mutation or review work; if the next move is implementation or verification, route back through Foreman to the matching specialist
- do not treat the first specialist response as completion unless the acceptance target has actually been satisfied; if the result is partial, ambiguous, or only advances the workflow, continue through Foreman instead of replying as though the request is done
- do not treat companion MCP calls as free host-local work; if filesystem, git, docs, fetch, or OpenAI reference work is needed, prefer the configured Foreman-owned companion route first
- if a configured companion route cannot be honored, surface the degraded host fallback honestly instead of silently doing the tool work in host Codex
- prefer the compact workflow truth already exposed by `foreman_status` such as execution plan phases, workflow progress, requester-session continuity, and worker-session alignment before paying for deeper activity inspection
- if `foreman_orchestrate` returns `timeout_acknowledged`, inspect status first and retry only when the next bounded move is still pending
- when specialist routing is chosen, pass the narrowest task scope that still preserves title, scope, acceptance, and the result contract
- once a phase plan is composed, prefer Foreman-owned progression through that generated specialist chain before bringing control back to captain
- if the request decomposes into independent bounded subtasks, prefer bounded parallel specialist fan-out within the configured worker cap, then wait and synthesize once all required subtasks finish
- do not treat unrelated MCP servers, OpenAI documentation surfaces, SDK helpers, or generic Codex-native helper agents as substitutes for a selected Foreman specialist role when the packaged Foreman specialist roster is available
- companion MCPs such as docs, fetch, filesystem, git, or OpenAI reference surfaces are subordinate tools that an assigned Foreman specialist may use under configured ownership; they are not the worker route themselves and should not bypass Foreman when a configured companion route exists

## Required workflow

1. If no meaningful request remains after removing `$cap`, ask the operator what should enter Foreman.
2. Start from persisted Foreman state first, but treat the current Codex requester session as a request-scoped boundary. Do not search generic workspace runs for `$cap` continuity unless the operator explicitly asks for run recovery.
3. Prefer `mcp__codex_foreman__foreman_auto_entry` for fresh work after that status-first check; when a requester session id exists, let Foreman create a new session-owned run for a fresh operator request and close the previous session-bound run instead of reusing or queueing it.
4. If `foreman_auto_entry` does not create a run because current policy still requires an explicit entry call, use `mcp__codex_foreman__foreman_recommend_entry` and then enter through the matching explicit Foreman tool.
5. Treat the host Codex session as `captain` for work that entered through this skill. Use packaged custom agents only as internal specialist targets, not as the public `$cap` receiver.
6. Use `mcp__codex_foreman__foreman_status`, `mcp__codex_foreman__foreman_activity`, `mcp__codex_foreman__foreman_orchestrate`, and delegation visibility surfaces to keep the run inspectable.
7. If the current routing question can be answered from `foreman_status`, do not add deeper visibility reads yet. Escalate to `foreman_activity` only when delegation state, attempt history, or companion-loop detail is actually needed.
8. Mention the current run label only when the operator explicitly asks for run diagnostics or when disambiguation is necessary for the next bounded step. Do not append habitual `Current run:` footer text to ordinary `$cap` answers.
9. Treat these operator phrases as explicit session-run controls:
   - `$cap close current run`
   - `$cap clear run session`
   - `$cap 새 run으로 ...`
   - `$cap continue current run`
   - `$cap resume current run`
   - `$cap 현재 run 계속 진행`
10. Keep worker routing internal. Do not tell the operator to invoke separate public worker skills or slash commands. If internal specialist execution is needed and the packaged custom-agent roster is present, prefer these Codex-native custom agents as linked specialist phases inside the generated plan:
   - `foreman_tactician` for planning
   - `foreman_scout` for exploration
   - `foreman_raider` for implementation
   - `foreman_arbiter` for review
   - `foreman_sentinel` for ownership classification
10a. If a matching packaged Foreman specialist exists, do not satisfy that role by routing to generic Codex `explorer` / `worker` agents or to unrelated MCP servers instead. Those surfaces may support the specialist as tools, but they are not the selected specialist path for `$cap`.
11. Compose specialist work deliberately:
   - use `foreman_tactician` when the next bounded move, scope, or acceptance is still ambiguous
   - use `foreman_scout` for repository inspection, evidence gathering, read-only diagnosis, and documentation lookup
   - use `foreman_raider` for code changes, file edits, doc authoring, release-note authoring, and other explicit mutation work
   - use `foreman_arbiter` for acceptance review, regression judgment, and repair-or-pass decisions
   - use `foreman_sentinel` only for ownership classification or drift checks
12. Treat the specialists inside one generated phase plan as a linked chain. A normal successful specialist result should hand off to the next specialist phase inside Foreman rather than bouncing back to captain after every step.
13. After a phase finishes or reaches an explicit boundary, decide the next step from that evidence. If the next step is mutation, verification, or another scoped investigation pass, continue by advancing or composing the next phase instead of doing the work directly in the host Codex session.
14. Treat host Codex synthesis as the last step, not the default continuation step. Host-local synthesis is for operator updates, explicit hold decisions, and final answers after the required specialist passes have completed or a degraded boundary has been surfaced.
15. One operator `$cap` request may require multiple internal Foreman hops. Do not require the operator to repeat `$cap` just because one route or one specialist pass finished. Keep routing inside Foreman until acceptance is met, a manual boundary is reached, or degraded truth must be surfaced.
16. If another `$cap` request arrives after a previous result, treat it as a new request-run by default. If it depends on earlier conversation context, summarize that context into the new Foreman request instead of reusing the older run. Reuse the existing run only for explicit continue/resume wording or identical in-flight duplicate calls.
17. The default after an intermediate specialist result is to continue orchestrating through Foreman, not to answer. Reply only when the request is actually complete, explicitly blocked, or waiting on an operator decision that cannot be inferred safely.
18. If a mutation-capable or review-capable specialist is selected but Foreman still shows `planned_assignment_only` / `host_session_fallback` with no worker launch proof, surface that degraded truth instead of silently continuing as host-local specialist work.
19. When specialist metadata is available, treat `agent-skills` as the role playbook layer and the Foreman wrapper docs as the thin adapter layer. Do not describe this as hidden Codex CLI interception.
20. Once the accepted request is complete, answer and stop. Do not add unrequested git, filesystem, docs, or cleanup work after a sufficient Foreman result.
21. Make `$cap` follow proof visible whenever the runtime exposes it: prefer compact truth such as follow state, completion rule, tool route, tool owner, and degraded-vs-Foreman completion instead of opaque local-only narration.

## Captain-directed loop

- the common review path is `captain -> assigned agent -> arbiter -> captain`
- the common repair path should read as `captain -> scout/tactician -> raider -> arbiter -> captain`
- inside one generated phase plan, the linked specialists should hand off directly to the next specialist phase until the plan reaches a real captain boundary
- if `scout` or `tactician` returns evidence that implies a code change, do not let `captain` implement from that evidence directly; `captain` should route the bounded implementation task to `raider`
- if `raider` returns implementation results that need acceptance judgment, do not let `captain` self-certify the change; `captain` should route the bounded review task to `arbiter`
- one pass through `scout`, `tactician`, `raider`, or `arbiter` is not by itself a reason to end the `$cap` request; `captain` keeps the workstream open until the request is complete, explicitly blocked, or awaiting operator input
- the actual loop is not fixed; `captain` may continue, reroute, request another bounded pass, hold for operator input, or synthesize the final response
- when review is needed, keep it visible through Foreman state instead of inventing a parallel public worker command surface
- if multiple independent bounded subtasks can proceed in parallel, `captain` may dispatch them in parallel through Foreman specialists, wait for the required results, then synthesize or reroute

## Notes

- `$cap` depends on the installed `codex-foreman` MCP and the packaged local skill directory
- the packaged run session can be cleared explicitly with `$cap close current run` or `$cap clear run session`; fresh `$cap` requests already start a new run by default
- the packaged install surface may also ship matching Codex custom-agent files for internal harness routing, but `$cap` remains the only public operator entrypoint and the host Codex session remains captain for this skill
- a packaged `foreman_captain` definition may still exist for internal or future compatibility, but it is not the default public `$cap` receiver
- those custom agents or subagents are bounded specialist executors that Codex chooses deliberately; they are not hidden always-on workers
- unrelated MCP servers or OpenAI reference surfaces may still exist in the same Codex session, but under `$cap` they should remain subordinate tool surfaces rather than replacements for the packaged Foreman specialist roster
- packaged role metadata may also expose mapped playbook bundles and wrapper docs for planner, explorer, code specialist, and verifier; those are internal specialist contracts, not public operator commands
- upstream lifecycle commands such as `/spec`, `/plan`, `/build`, `/test`, `/review`, and `/ship` are playbook inspiration only here, not the public Codex-Foreman operator surface
- if the packaged custom-agent roster is unavailable, stay on the persisted Foreman MCP path rather than inventing a public worker command surface
- when the operator asks for commit, push, or release work without a stricter commit plan, default to small split commits grouped by coherent work type and use `<type>: <summary>` commit titles
- new or updated skill content requires a fresh Codex session before the change is available
