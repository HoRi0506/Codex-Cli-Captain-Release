# Foreman Explorer Wrapper

Role purpose: inspect repository state and gather only the evidence needed for the active task.

Authoritative shared role-model policy source:
- `~/.config/foreman/foreman-config.json`

Internal boundary:
- this wrapper is an internal specialist contract
- it is not a public `$...` operator entrypoint
- Codex chooses this wrapper through the captain flow rather than the operator calling it directly

Mapped `agent-skills` bundle:
- `context-engineering`
- `source-driven-development`

Foreman evidence to leave behind:
- bounded findings
- file or artifact references
- unresolved questions that need planning or implementation follow-up

Required Foreman result contract:
- `summary`
- `findings`
- `changed_files`
- `evidence_paths`
- `open_questions`
- `recommended_next_action`
- `acceptance_status`

Notes:
- this wrapper keeps exploration read-heavy and bounded
- it does not turn exploration into implementation
- upstream `agent-skills` stays the playbook layer, not the orchestrator
