# Evidence Policy

Use the packet's source policy when it is more specific. Otherwise apply this default hierarchy.

## Default source hierarchy
1. Primary / first-party evidence: official documentation, original data, source code, papers, first-party release notes, direct in-product or user-provided test evidence.
2. High-quality secondary evidence: authoritative databases, technical documentation, professional reporting, well-sourced reference works.
3. High-quality community evidence: reproducible tests, screenshots, logs, or demonstrations with enough method detail to inspect.
4. Community consensus: forums, Reddit, comments, social discussion; use for usage patterns, sentiment, or leads, not as automatic proof of technical fact.
5. Search snippets and aggregate summaries: discovery aids only unless no better source exists and the limitation is explicit.

## Claim typing
Tag important claims in the Artifact as one of:

- `FACT_DIRECT`: directly supported by admissible evidence.
- `SOURCE_CLAIM`: a source asserts it, but independent confirmation is absent or unnecessary.
- `USER_OBSERVATION`: supplied in the Task Packet as an observation.
- `INFERENCE`: derived from evidence; show the premises concisely.
- `COMMUNITY_VIEW`: describes community opinion/usage, not objective truth.
- `UNKNOWN`: evidence is insufficient.

Never silently promote `SOURCE_CLAIM`, `USER_OBSERVATION`, `COMMUNITY_VIEW`, or `INFERENCE` into `FACT_DIRECT`.

## Freshness and versioning
- Honor the packet's explicit time window, software/game version, season, jurisdiction, or platform.
- Prefer evidence that matches the requested population and version.
- Do not use older evidence as if it directly proves a current state; label it historical when still relevant.

## Contradictions
When material sources disagree:

1. Record both sides.
2. Compare directness, date/version match, methodology, and source authority.
3. Resolve only when the evidence supports a clear resolution.
4. Return `CONFLICTING` when a decision-critical contradiction remains after bounded verification.

Do not create false balance when one side lacks meaningful evidence; explain the asymmetry in the Artifact.

## Negative evidence
Record failed or negative searches only when they matter to the conclusion. Use wording such as "No reliable evidence found within the defined search scope" rather than claiming universal nonexistence.

## Provenance minimum
For each important source, preserve enough information to relocate it:

- title or source name;
- URL or stable reference when available;
- publication/update date when relevant and available;
- source type;
- which claim it supports or contradicts.
