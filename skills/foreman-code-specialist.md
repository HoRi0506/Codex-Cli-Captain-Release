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

Phase composition contract:
- phase: `mutate`
- call when: mutation is required, or a conditional gate has evidence of a concrete mismatch
- required input: mutation scope, frozen evidence checkpoint, acceptance checks, allowed files or ownership boundary
- must not: mutate without scout/gate evidence for conditional work, widen scope, or return success without a result contract
- handoff output: changed files, validation evidence, no-op reason when mutation is not needed, remaining risk, recommended next phase

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
- this wrapper keeps implementation incremental and bounded
- it does not claim that Foreman replaced Codex as the execution engine
- Codex still decides when implementation should run and when review should follow
