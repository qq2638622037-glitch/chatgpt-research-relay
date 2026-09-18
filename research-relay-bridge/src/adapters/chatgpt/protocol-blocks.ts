import {
  validateResultEnvelope,
  validateTaskPacket,
  type ValidationIssue,
} from '../../protocol/validate'

export type ProtocolKind = 'task' | 'result'

export interface ProtocolCandidate {
  kind: ProtocolKind
  rawYaml: string
  taskId?: string
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  element: HTMLElement
}

const TASK_MARKER = /^\s*protocol:\s*research-task\/v1\s*$/m
const RESULT_MARKER = /^\s*protocol:\s*research-result\/v1\s*$/m

function isInsideEditable(element: Element): boolean {
  return Boolean(
    element.closest(
      'textarea, input, [contenteditable="true"], [contenteditable="plaintext-only"]',
    ),
  )
}

function asCandidate(element: HTMLElement): ProtocolCandidate | null {
  if (isInsideEditable(element)) return null

  const rawYaml = element.textContent ?? ''
  let kind: ProtocolKind | null = null

  if (TASK_MARKER.test(rawYaml)) kind = 'task'
  else if (RESULT_MARKER.test(rawYaml)) kind = 'result'
  else return null

  const validation =
    kind === 'task'
      ? validateTaskPacket(rawYaml)
      : validateResultEnvelope(rawYaml)

  return {
    kind,
    rawYaml,
    taskId: validation.value?.task_id,
    valid: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
    element,
  }
}

export function findProtocolCandidates(
  root: ParentNode = document,
): ProtocolCandidate[] {
  const nodes: HTMLElement[] = []

  if (root instanceof HTMLElement) {
    if (root.matches('code') && root.parentElement?.matches('pre')) {
      nodes.push(root)
    } else if (root.matches('pre') && !root.querySelector(':scope > code')) {
      nodes.push(root)
    }
  }

  nodes.push(...Array.from(root.querySelectorAll<HTMLElement>('pre > code')))
  nodes.push(
    ...Array.from(
      root.querySelectorAll<HTMLElement>('pre:not(:has(> code))'),
    ),
  )

  return Array.from(new Set(nodes))
    .map(asCandidate)
    .filter((candidate): candidate is ProtocolCandidate => candidate !== null)
}
