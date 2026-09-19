// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import type { ProtocolCandidate } from '../src/adapters/chatgpt/protocol-blocks'
import { mountTaskControl } from '../src/ui/inline-controls'

function makeTaskCandidate(code: HTMLElement): ProtocolCandidate {
  return {
    kind: 'task',
    rawYaml: 'protocol: research-task/v1',
    taskId: 'RR-SMOKE-20260918-002',
    valid: true,
    errors: [],
    warnings: [],
    element: code,
  }
}

describe('inline task control mounting', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('does not duplicate a live control', () => {
    document.body.innerHTML =
      '<div id="message"><pre><code>protocol: research-task/v1</code></pre></div>'

    const code = document.querySelector<HTMLElement>('code')
    expect(code).not.toBeNull()

    const candidate = makeTaskCandidate(code!)
    mountTaskControl(candidate)
    mountTaskControl(candidate)

    expect(
      document.querySelectorAll('[data-research-relay-ui="task-control"]'),
    ).toHaveLength(1)
  })

  it('self-heals when ChatGPT removes the control but preserves the marked pre', () => {
    document.body.innerHTML =
      '<div id="message"><pre><code>protocol: research-task/v1</code></pre></div>'

    const code = document.querySelector<HTMLElement>('code')
    const pre = document.querySelector<HTMLElement>('pre')
    expect(code).not.toBeNull()
    expect(pre).not.toBeNull()

    const candidate = makeTaskCandidate(code!)
    mountTaskControl(candidate)

    const firstControl = document.querySelector<HTMLElement>(
      '[data-research-relay-ui="task-control"]',
    )
    expect(firstControl).not.toBeNull()
    expect(pre!.getAttribute('data-research-relay-control')).toBe('task')

    firstControl!.remove()

    // React-style rerender: extension sibling is gone, but the preserved
    // <pre> still carries the old mount marker.
    expect(pre!.getAttribute('data-research-relay-control')).toBe('task')
    expect(
      document.querySelector('[data-research-relay-ui="task-control"]'),
    ).toBeNull()

    mountTaskControl(candidate)

    expect(
      document.querySelectorAll('[data-research-relay-ui="task-control"]'),
    ).toHaveLength(1)
    expect(pre!.getAttribute('data-research-relay-control')).toBe('task')
  })
})
