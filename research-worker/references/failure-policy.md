# Failure Policy

Handle failure explicitly and locally. A failed source or subquestion does not automatically invalidate the entire task.

## Missing required input

Return `BLOCKED` when an essential packet input or required Artifact is unavailable and the task cannot be executed faithfully. Identify the exact missing input in `unresolved` and `recommended_next_action`.

Do not replace a missing required input with remembered Worker history.

## Source unavailable

When one source fails to load:

- Continue with allowed alternatives when the packet permits them.
- Record the access failure in the Artifact if it matters.
- Return `PARTIAL` or `BLOCKED` only when the unavailable source leaves a decision-critical gap.

## No useful evidence

After bounded search, return `NO_EVIDENCE` when reliable evidence for the core question was not found. Report the search scope and important negative evidence in the Artifact. Do not invent an answer.

## Conflicting evidence

Return `CONFLICTING` when decision-critical evidence remains genuinely unresolved after the allowed refinement rounds. Do not force a winner merely because one conclusion is more convenient for Master.

## Partial completion

Return `PARTIAL` when some questions are answered and others remain open. Preserve answered findings; do not discard useful work because one branch failed.

## Schema or packet problem

If the protocol is malformed but the intended task is still unambiguous and safe to execute, proceed cautiously and document the normalization in the Artifact. If the malformed packet creates a material ambiguity about scope, required sources, or objective, return `BLOCKED` rather than guessing.

## Tool failure

If browsing, file creation, or a connector fails:

- Use an allowed fallback when available.
- Distinguish tool failure from absence of evidence.
- Never report `NO_EVIDENCE` solely because a tool failed.
