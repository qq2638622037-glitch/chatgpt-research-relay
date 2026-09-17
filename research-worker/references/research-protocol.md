# Research Protocol

## 1. Frame the task
Translate the packet's `questions` into a small checklist. Preserve the wording and decision use. Split complex questions into non-overlapping internal subquestions only when needed.

Do not emit a long planning preamble. Keep planning operational and task-local.

## 2. Build the first evidence pass
Search or inspect the highest-priority sources first. For each decision-critical claim:

- Open the actual source rather than relying on a search snippet.
- Prefer the current and directly relevant version/page.
- Record enough provenance for another reviewer to reproduce the finding.
- Distinguish direct evidence from interpretation.

Use search snippets, aggregators, or remembered terms only for discovery unless the packet explicitly permits them as evidence.

## 3. Run a gap check
After the initial pass, check:

- Is every required question answered?
- Is each important answer supported by admissible evidence?
- Did required sources get inspected?
- Is the evidence current enough for the packet's freshness rule?
- Is there material contradictory evidence?
- Are any conclusions only inference?

Do not refine merely because more sources exist.

## 4. Refine only where gaps remain
Use each refinement round to target a named gap: missing primary source, freshness issue, contradiction, ambiguous terminology, or missing subquestion.

Treat `max_refinement_rounds` as a hard maximum after the initial pass. Stop early when evidence sufficiency is reached.

## 5. Decide evidence sufficiency
Treat evidence as sufficient when all decision-critical questions have an answer at the strength required by the task, required sources were handled, material conflicts are resolved or correctly exposed, and remaining uncertainty would not change the reported status.

If the task remains open at the budget limit, return `PARTIAL`, `CONFLICTING`, `BLOCKED`, or `NO_EVIDENCE` as appropriate.

## 6. Compile the Artifact
Move detailed evidence, provenance, contradictions, negative searches, and reasoning conclusions into the Evidence Artifact. Do not preserve or expose hidden chain-of-thought. Record only inspectable evidence and concise explicit rationale.

## 7. Return the Envelope
Return only the compact decision-relevant Result Envelope after the Artifact is available.
