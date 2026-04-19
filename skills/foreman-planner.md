# Foreman Planner Wrapper

Role purpose: turn ambiguous work into the next bounded move without widening scope.

Authoritative shared role-model policy source:
- `~/.config/foreman/foreman-config.json`

Internal boundary:
- this wrapper is an internal specialist contract
- it is not a public `$...` operator entrypoint
- Codex chooses this wrapper through the captain flow rather than the operator calling it directly

Mapped `agent-skills` bundle:
- `spec-driven-development`
- `planning-and-task-breakdown`

Foreman evidence to leave behind:
- bounded scope summary
- concrete acceptance target
- open questions that still block execution

Phase composition contract:
- phase: `plan`
- call when: the request is ambiguous, broad, multi-step, high risk, or needs decomposition before specialist work
- required input: operator request, request traits, ambiguity/risk summary, known constraints
- must not: mutate files or perform final verification
- handoff output: refined traits, proposed phases, acceptance checks, blockers, recommended next phase

Required Foreman result contract:
- `summary`
- `findings`
- `changed_files`
- `evidence_paths`
- `open_questions`
- `recommended_next_action`
- `acceptance_status`
- `phase`
- `phase_status`
- `evidence_checkpoint_id`
- `recommended_next_phase`
- `handoff_summary`
- `freshness`
- `risk_summary`

Notes:
- this wrapper is a thin adapter over upstream playbooks
- it does not claim hidden Codex CLI interception
- Codex remains the orchestrator and chooses when planner work is needed
