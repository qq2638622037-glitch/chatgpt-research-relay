import { browser, type Browser } from 'wxt/browser'
import { defineBackground } from 'wxt/utils/define-background'
import {
  probeWorkerContextWithRetry,
  WORKER_CONTEXT_PROBE_TYPE,
} from '../src/adapters/chatgpt/worker-context'
import {
  bridgeMessageSchema,
  isApprovedChatGptUrl,
} from '../src/messaging/messages'
import { selectWorkerTab } from '../src/navigation/worker-tabs'
import {
  beginWorkerOpening,
  cancelRelay,
  confirmWorkerContext,
  failWorkerAdapter,
  failWorkerOpening,
  startRelay,
} from '../src/relay/controller'
import type { ActiveRelay } from '../src/relay/types'
import {
  getActiveRelay,
  getBridgeConfig,
  setBridgeConfig,
} from '../src/storage/store'

function isExtensionUiSender(
  sender: Browser.runtime.MessageSender,
): boolean {
  return sender.id === browser.runtime.id && sender.tab == null
}

async function getApprovedActiveChatGptTab() {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  })

  if (!tab?.url || !isApprovedChatGptUrl(tab.url)) return null
  return tab
}

async function openOrFocusWorkerProject(
  relay: ActiveRelay,
): Promise<{ tabId: number; action: 'opened' | 'focused' }> {
  if (!isApprovedChatGptUrl(relay.workerEntryUrl)) {
    throw new Error('Stored Worker entry URL is not an approved ChatGPT URL')
  }

  const chatGptTabs = await browser.tabs.query({
    url: 'https://chatgpt.com/*',
  })
  const existing = selectWorkerTab(
    chatGptTabs,
    relay.workerEntryUrl,
    relay.workerTabIdHint,
  )

  if (existing?.id != null) {
    await browser.tabs.update(existing.id, { active: true })
    await browser.windows.update(existing.windowId, { focused: true })
    return { tabId: existing.id, action: 'focused' }
  }

  const created = await browser.tabs.create({
    url: relay.workerEntryUrl,
    active: true,
  })

  if (created.id == null) {
    throw new Error('Browser did not return a Worker tab ID')
  }

  await browser.windows.update(created.windowId, { focused: true })
  return { tabId: created.id, action: 'opened' }
}

async function verifyWorkerAdapterAndContext(
  tabId: number,
  workerEntryUrl: string,
) {
  return probeWorkerContextWithRetry({
    expectedWorkerEntryUrl: workerEntryUrl,
    probe: () =>
      browser.tabs.sendMessage(tabId, {
        type: WORKER_CONTEXT_PROBE_TYPE,
      }),
  })
}

async function startRelayAndOpenWorker(params: {
  rawTask: string
  masterUrl: string
  masterTabIdHint?: number
}) {
  const started = await startRelay(params)
  if (!started.ok) return started

  const active = await getActiveRelay()
  if (!active) {
    return { ok: false, error: 'WORKER_OPEN_FAILED' }
  }

  if (
    active.state !== 'TASK_VALIDATED' &&
    active.state !== 'WORKER_OPENING' &&
    active.state !== 'ERROR_RECOVERABLE'
  ) {
    return started
  }

  const opening = await beginWorkerOpening()
  if (!opening.ok) {
    return { ok: false, error: 'WORKER_OPEN_FAILED' }
  }

  let navigation: { tabId: number; action: 'opened' | 'focused' }

  try {
    navigation = await openOrFocusWorkerProject(opening.relay)
    const persisted = await beginWorkerOpening(navigation.tabId)

    if (!persisted.ok) {
      throw new Error('Could not persist Worker tab hint')
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown Worker open failure'
    await failWorkerOpening(message)
    return {
      ok: false,
      error: 'WORKER_OPEN_FAILED',
      taskId: started.taskId,
    }
  }

  const context = await verifyWorkerAdapterAndContext(
    navigation.tabId,
    opening.relay.workerEntryUrl,
  )

  if (!context.ok) {
    await failWorkerAdapter(context.reason)
    return {
      ok: false,
      error: 'ADAPTER_UNHEALTHY',
      taskId: started.taskId,
    }
  }

  const confirmed = await confirmWorkerContext({
    observedUrl: context.observedUrl,
    adapterVersion: context.adapterVersion,
  })

  if (!confirmed.ok) {
    await failWorkerAdapter('Could not persist Worker adapter/context proof')
    return {
      ok: false,
      error: 'ADAPTER_UNHEALTHY',
      taskId: started.taskId,
    }
  }

  return {
    ...started,
    state: confirmed.relay.state,
    workerAction: navigation.action,
    workerContextVerified: true,
    workerContextProbeAttempts: context.attempts,
  }
}

export default defineBackground({
  type: 'module',
  main() {
    browser.runtime.onMessage.addListener(
      async (message: unknown, sender: Browser.runtime.MessageSender) => {
        const parsed = bridgeMessageSchema.safeParse(message)
        if (!parsed.success) {
          return { ok: false, error: 'INVALID_MESSAGE' }
        }

        const fromChatGpt = isApprovedChatGptUrl(sender.url)
        const fromExtensionUi = isExtensionUiSender(sender)

        if (parsed.data.type === 'GET_STATE') {
          if (!fromChatGpt && !fromExtensionUi) {
            return { ok: false, error: 'UNAPPROVED_SENDER' }
          }

          return {
            ok: true,
            config: await getBridgeConfig(),
            activeRelay: await getActiveRelay(),
          }
        }

        if (parsed.data.type === 'SET_WORKER_ENTRY_CURRENT_TAB') {
          if (!fromExtensionUi) {
            return { ok: false, error: 'UNAPPROVED_SENDER' }
          }

          const tab = await getApprovedActiveChatGptTab()
          if (!tab?.url) {
            return { ok: false, error: 'ACTIVE_TAB_NOT_CHATGPT' }
          }

          await setBridgeConfig({
            schemaVersion: 1,
            workerEntryUrl: tab.url,
            configuredAt: new Date().toISOString(),
          })

          return { ok: true, workerEntryUrl: tab.url }
        }

        if (parsed.data.type === 'CANCEL_RELAY') {
          if (!fromExtensionUi) {
            return { ok: false, error: 'UNAPPROVED_SENDER' }
          }

          return cancelRelay()
        }

        if (!fromChatGpt || !sender.url) {
          return { ok: false, error: 'UNAPPROVED_SENDER' }
        }

        if (parsed.data.type === 'START_RELAY') {
          if (parsed.data.masterUrl !== sender.url) {
            return { ok: false, error: 'MASTER_URL_MISMATCH' }
          }

          return startRelayAndOpenWorker({
            rawTask: parsed.data.rawTask,
            masterUrl: sender.url,
            masterTabIdHint: sender.tab?.id,
          })
        }

        return {
          ok: false,
          error: 'NOT_IMPLEMENTED_IN_CURRENT_SLICE',
        }
      },
    )
  },
})
