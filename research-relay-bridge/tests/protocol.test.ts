import { describe, expect, it } from 'vitest'
import {
  validateResultEnvelope,
  validateTaskPacket,
} from '../src/protocol/validate'
import { normalizeProtocolText } from '../src/protocol/hash'

const validTask = `protocol: research-task/v1
task_id: RR-20260918-ABC123
objective: "Verify a bounded fact."
decision_use: "Inform the Master decision."
known_facts: []
questions:
  - "What is true?"
scope:
  include: []
  exclude: []
constraints: []
artifact_inputs: []
source_policy:
  priority: []
  required: []
  forbidden: []
  freshness: "current"
research_budget:
  depth: standard
  max_refinement_rounds: 2
output_contract:
  artifact_required: true
  artifact_target: "chat_file"
  master_digest_max_chars: 600
  expose_conflicts: true
  expose_uncertainty: true
stop_conditions:
  - "Evidence is sufficient."
`

const validResult = `protocol: research-result/v1
task_id: RR-20260918-ABC123
status: COMPLETE
confidence: HIGH
master_digest: "Closed."
key_findings: []
conflicts: []
unresolved: []
recommended_next_action: []
artifact_ref: "RR-20260918-ABC123_evidence.md"
`

describe('task validation', () => {
  it('accepts a canonical task', () => {
    expect(validateTaskPacket(validTask).valid).toBe(true)
  })

  it('rejects a missing decision_use', () => {
    const raw = validTask.replace('decision_use: "Inform the Master decision."\n', '')
    expect(validateTaskPacket(raw).valid).toBe(false)
  })

  it('rejects a duplicate YAML key', () => {
    const raw = validTask.replace(
      'task_id: RR-20260918-ABC123',
      'task_id: RR-20260918-ABC123\ntask_id: RR-OTHER',
    )
    expect(validateTaskPacket(raw).valid).toBe(false)
  })

  it('rejects YAML aliases', () => {
    const raw = validTask.replace(
      'constraints: []',
      'constraints: &shared []\nextra: *shared',
    )
    expect(validateTaskPacket(raw).valid).toBe(false)
  })

  it('rejects YAML anchors even when never referenced', () => {
    const raw = validTask.replace(
      'constraints: []',
      'constraints: &shared []',
    )
    expect(validateTaskPacket(raw).valid).toBe(false)
  })

  it('preserves unknown fields structurally', () => {
    const result = validateTaskPacket(`${validTask}bridge_extension: true\n`)
    expect(result.valid).toBe(true)
    expect((result.value as Record<string, unknown>).bridge_extension).toBe(true)
  })
})

describe('result validation', () => {
  it('accepts a matching result', () => {
    expect(
      validateResultEnvelope(validResult, 'RR-20260918-ABC123').valid,
    ).toBe(true)
  })

  it('rejects a mismatched result task_id', () => {
    const result = validateResultEnvelope(validResult, 'RR-OTHER')
    expect(result.valid).toBe(false)
    expect(result.errors[0]?.path).toBe('task_id')
  })

  it.each(['COMPLETE', 'PARTIAL', 'BLOCKED', 'CONFLICTING', 'NO_EVIDENCE'])(
    'accepts status %s',
    (status) => {
      const raw = validResult.replace('status: COMPLETE', `status: ${status}`)
      expect(validateResultEnvelope(raw).valid).toBe(true)
    },
  )
})

describe('protocol text normalization', () => {
  it('normalizes line endings and edge blank lines only', () => {
    expect(normalizeProtocolText('\r\na: 1\r\n  b: 2\r\n\r\n')).toBe(
      'a: 1\n  b: 2',
    )
  })

  it('preserves internal whitespace differences', () => {
    expect(normalizeProtocolText('a: 1\n b: 2')).not.toBe(
      normalizeProtocolText('a: 1\n  b: 2'),
    )
  })
})
