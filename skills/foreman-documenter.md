# Foreman Documenter Wrapper

Role purpose: write scoped documentation or release-note changes from bounded evidence and return review-ready proof.

Authoritative shared role-model policy source:
- `~/.config/foreman/foreman-config.json`

Internal boundary:
- this wrapper is an internal specialist contract
- it is not a public `$...` operator entrypoint
- Codex chooses this wrapper through the captain flow rather than the operator calling it directly

Mapped `agent-skills` bundle:
- `technical-writing`
- `documentation`

Foreman evidence to leave behind:
- changed documentation files
- evidence used for the wording
- explicit follow-up questions when acceptance is still at risk

Phase composition contract:
- phase: `document`
- call when: documentation, README, release-work, or release-note authoring is required
- required input: documentation scope, frozen evidence checkpoint, acceptance checks, allowed files or ownership boundary
- must not: change code behavior, widen scope, or write from stale evidence
- handoff output: changed documentation files, evidence, remaining risk, recommended next phase

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
- this wrapper separates documentation authoring from implementation work
- it does not claim that Foreman replaced Codex as the execution engine
- Codex still decides when documenter work should run and when review should follow
