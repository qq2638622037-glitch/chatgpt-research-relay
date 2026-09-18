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

function isInsideNonAssistantMessage(element: Element): boolean {
  const message = element.closest('[data-message-author-role]')
  if (!message) return false
  return message.getAttribute('data-message-author-role') !== 'assistant'
}

function hasProtocolMarker(text: string): boolean {
  return TASK_MARKER.test(text) || RESULT_MARKER.test(text)
}

function asCandidate(element: HTMLElement): ProtocolCandidate | null {
  if (isInsideEditable(element) || isInsideNonAssistantMessage(element)) {
    return null
  }

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

function collectProtocolNodes(root: ParentNode): HTMLElement[] {
  const nodes: HTMLElement[] = []
  const seen = new Set<HTMLElement>()

  const add = (node: HTMLElement | null) => {
    if (!node || seen.has(node)) return
    seen.add(node)
    nodes.push(node)
  }

  if (root instanceof HTMLElement) {
    add(root.closest<HTMLElement>('code, pre'))
    if (root.matches('code, pre')) add(root)
  }

  for (const code of root.querySelectorAll<HTMLElement>('code')) {
    add(code)
  }

  for (const pre of root.querySelectorAll<HTMLElement>('pre')) {
    const codeDescendants = Array.from(pre.querySelectorAll<HTMLElement>('code'))
    const descendantAlreadyCarriesPacket = codeDescendants.some((code) =>
      hasProtocolMarker(code.textContent ?? ''),
    )

    if (!descendantAlreadyCarriesPacket) {
      add(pre)
    }
  }

  return nodes
}

export function findProtocolCandidates(
  root: ParentNode = document,
): ProtocolCandidate[] {
  return collectProtocolNodes(root)
    .map(asCandidate)
    .filter((candidate): candidate is ProtocolCandidate => candidate !== null)
}
