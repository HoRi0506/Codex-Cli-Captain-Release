# Foreman Verifier Wrapper

Role purpose: check the result against scope and acceptance before it returns upstream.

Authoritative shared role-model policy source:
- `~/.config/foreman/foreman-config.json`

Internal boundary:
- this wrapper is an internal specialist contract
- it is not a public `$...` operator entrypoint
- Codex chooses this wrapper through the captain flow rather than the operator calling it directly

Mapped `agent-skills` bundle:
- `debugging-and-error-recovery`
- `code-review-and-quality`
- `security-and-hardening`

Foreman evidence to leave behind:
- acceptance verdict
- supporting review findings
- clear repair or completion recommendation

Phase composition contract:
- phase: `verify`
- call when: acceptance, regression, freshness, or repair judgment is required
- required input: evidence checkpoint id, acceptance checks, command/test outcomes, changed files, worker result envelopes
- must not: judge against stale sibling-run evidence or treat missing evidence as actual failure
- handoff output: outcome, needs-work reason, evidence freshness, repair recommendation, recommended next phase

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
- this wrapper keeps review explicit and acceptance-oriented
- it does not claim unsupported hidden plugin interception
- Codex remains responsible for the final orchestration decision
