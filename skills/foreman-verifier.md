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

Required Foreman result contract:
- `summary`
- `findings`
- `changed_files`
- `evidence_paths`
- `open_questions`
- `recommended_next_action`
- `acceptance_status`

Notes:
- this wrapper keeps review explicit and acceptance-oriented
- it does not claim unsupported hidden plugin interception
- Codex remains responsible for the final orchestration decision
