import type { ProtocolCandidate } from '../adapters/chatgpt/protocol-blocks'

const MOUNT_ATTR = 'data-research-relay-control'

function makeStatus(text: string): HTMLSpanElement {
  const status = document.createElement('span')
  status.textContent = text
  status.style.fontSize = '12px'
  status.style.opacity = '0.75'
  return status
}

export function mountTaskControl(candidate: ProtocolCandidate): void {
  if (candidate.kind !== 'task' || !candidate.valid) return

  const pre = candidate.element.closest('pre')
  if (!pre || pre.hasAttribute(MOUNT_ATTR)) return

  pre.setAttribute(MOUNT_ATTR, 'task')

  const wrapper = document.createElement('div')
  wrapper.dataset.researchRelayUi = 'task-control'
  wrapper.style.display = 'flex'
  wrapper.style.gap = '8px'
  wrapper.style.alignItems = 'center'
  wrapper.style.marginTop = '6px'

  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = 'Send to Worker'
  button.dataset.researchRelayAction = 'send-to-worker'

  const status = makeStatus('Research Relay')

  button.addEventListener('click', async () => {
    button.disabled = true
    status.textContent = 'Validating…'

    try {
      const response = (await browser.runtime.sendMessage({
        type: 'START_RELAY',
        rawTask: candidate.element.textContent ?? '',
        masterUrl: location.href,
      })) as {
        ok: boolean
        error?: string
        taskId?: string
        alreadyActive?: boolean
      }

      if (!response.ok) {
        status.textContent = response.error ?? 'Relay start failed'
        return
      }

      status.textContent = response.alreadyActive
        ? `Relay already active: ${response.taskId ?? ''}`
        : `Relay captured: ${response.taskId ?? ''}`
    } catch {
      status.textContent = 'Relay start failed'
    } finally {
      button.disabled = false
    }
  })

  wrapper.append(button, status)
  pre.insertAdjacentElement('afterend', wrapper)
}
