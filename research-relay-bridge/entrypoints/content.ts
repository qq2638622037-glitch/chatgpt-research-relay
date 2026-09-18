import { defineContentScript } from 'wxt/utils/define-content-script'
import { findProtocolCandidates } from '../src/adapters/chatgpt/protocol-blocks'
import { mountTaskControl } from '../src/ui/inline-controls'

const DEBOUNCE_MS = 120

export default defineContentScript({
  matches: ['https://chatgpt.com/*'],
  runAt: 'document_idle',
  main() {
    const pendingRoots = new Set<ParentNode>()
    let timer: ReturnType<typeof setTimeout> | undefined

    const scan = (root: ParentNode) => {
      for (const candidate of findProtocolCandidates(root)) {
        if (candidate.kind === 'task') {
          mountTaskControl(candidate)
        }
      }
    }

    const flush = () => {
      timer = undefined
      const roots = Array.from(pendingRoots)
      pendingRoots.clear()

      for (const root of roots) {
        scan(root)
      }
    }

    const schedule = (root: ParentNode) => {
      pendingRoots.add(root)
      if (timer) clearTimeout(timer)
      timer = setTimeout(flush, DEBOUNCE_MS)
    }

    scan(document)

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          if (mutation.target.parentElement) {
            schedule(mutation.target.parentElement)
          }
          continue
        }

        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            schedule(node)
          }
        }
      }
    })

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    window.addEventListener(
      'pagehide',
      () => {
        observer.disconnect()
        if (timer) clearTimeout(timer)
      },
      { once: true },
    )
  },
})
