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

Required Foreman result contract:
- `summary`
- `findings`
- `changed_files`
- `evidence_paths`
- `open_questions`
- `recommended_next_action`
- `acceptance_status`

Notes:
- this wrapper is a thin adapter over upstream playbooks
- it does not claim hidden Codex CLI interception
- Codex remains the orchestrator and chooses when planner work is needed
