import { z } from 'zod'

const nonEmptyString = z.string().trim().min(1)
const stringArray = z.array(z.string())

const knownFactSchema = z
  .object({
    fact: nonEmptyString,
    status: z.enum(['confirmed', 'user_observation', 'working_assumption']),
  })
  .loose()

const artifactInputSchema = z
  .object({
    ref: nonEmptyString,
    purpose: nonEmptyString,
    required: z.boolean(),
  })
  .loose()

export const taskPacketSchema = z
  .object({
    protocol: z.literal('research-task/v1'),
    task_id: nonEmptyString,
    objective: nonEmptyString,
    decision_use: nonEmptyString,
    known_facts: z.array(knownFactSchema),
    questions: z.array(nonEmptyString).min(1),
    scope: z
      .object({
        include: stringArray,
        exclude: stringArray,
      })
      .loose(),
    constraints: stringArray,
    artifact_inputs: z.array(artifactInputSchema),
    source_policy: z
      .object({
        priority: stringArray,
        required: stringArray,
        forbidden: stringArray,
        freshness: z.string(),
      })
      .loose(),
    research_budget: z
      .object({
        depth: z.enum(['light', 'standard', 'deep']),
        max_refinement_rounds: z.number().int().nonnegative(),
      })
      .loose(),
    output_contract: z
      .object({
        artifact_required: z.boolean(),
        artifact_target: nonEmptyString,
        master_digest_max_chars: z.number().int().positive(),
        expose_conflicts: z.boolean(),
        expose_uncertainty: z.boolean(),
      })
      .loose(),
    stop_conditions: z.array(nonEmptyString).min(1),
  })
  .loose()

export const resultEnvelopeSchema = z
  .object({
    protocol: z.literal('research-result/v1'),
    task_id: nonEmptyString,
    status: z.enum([
      'COMPLETE',
      'PARTIAL',
      'BLOCKED',
      'CONFLICTING',
      'NO_EVIDENCE',
    ]),
    confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    master_digest: nonEmptyString,
    key_findings: stringArray,
    conflicts: stringArray,
    unresolved: stringArray,
    recommended_next_action: stringArray,
    artifact_ref: nonEmptyString,
  })
  .loose()

export type TaskPacket = z.infer<typeof taskPacketSchema>
export type ResultEnvelope = z.infer<typeof resultEnvelopeSchema>
