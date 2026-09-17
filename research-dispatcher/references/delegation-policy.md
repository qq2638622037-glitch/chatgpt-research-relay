# Delegation Policy

## Delegate when
Create a Worker packet when one or more of these conditions apply:
- The Master project is long-running and the requested research would generate substantial search/tool output.
- The research can be answered independently from a small subset of project context.
- The task needs focused web/source verification while the Master should retain only the decision-relevant result.
- The same Master must coordinate several research threads without absorbing every search path.
- The task benefits from a clean research context to reduce contamination from old project conclusions.

## Keep in Master when
Do not delegate merely for ceremony. Keep the work in the current chat when:
- No external research is needed.
- The answer depends on broad synthesis across much of the existing Master context and cannot be represented compactly without losing essential meaning.
- The research is trivial enough that creating and transferring a packet would cost more context than doing the check directly.
- The user explicitly wants the current chat to perform the research itself.

## Split a task when
Prefer multiple packets when any of the following is true:
- Subquestions require materially different source policies or freshness windows.
- The task spans unrelated domains that can be researched independently.
- A single Worker would need a large amount of background that only applies to some subquestions.
- One subquestion can fail or conflict without blocking the others.
- The expected Evidence Artifact would become a mixed report that is difficult to audit.

Keep packets mutually comprehensible but non-overlapping. Let Master perform cross-packet synthesis.

## Context firewall rules
- Send only explicit packet fields and explicitly named `artifact_inputs`.
- Never instruct the Worker to "read the whole project" or "use everything we discussed before".
- Convert relevant Master history into atomic `known_facts`, constraints, or questions.
- Preserve uncertainty labels when compressing history.
- Do not upgrade a user observation or working assumption into a confirmed fact during compression.
- Do not include conclusions merely because they are memorable; include them only if they affect the current task.
