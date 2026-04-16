# Foreman Code Specialist Wrapper

Role purpose: deliver the scoped implementation slice and return evidence that the slice is ready for review.

Authoritative shared role-model policy source:
- `~/.config/foreman/foreman-config.json`

Internal boundary:
- this wrapper is an internal specialist contract
- it is not a public `$...` operator entrypoint
- Codex chooses this wrapper through the captain flow rather than the operator calling it directly

Mapped `agent-skills` bundle:
- `incremental-implementation`
- `test-driven-development`
- `api-and-interface-design`

Foreman evidence to leave behind:
- changed files
- focused validation evidence
- explicit follow-up questions when acceptance is still at risk

Required Foreman result contract:
- `summary`
- `findings`
- `changed_files`
- `evidence_paths`
- `open_questions`
- `recommended_next_action`
- `acceptance_status`

Notes:
- this wrapper keeps implementation incremental and bounded
- it does not claim that Foreman replaced Codex as the execution engine
- Codex still decides when implementation should run and when review should follow
