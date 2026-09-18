import {
  bridgeMessageSchema,
  isApprovedChatGptUrl,
} from '../src/messaging/messages'
import {
  getActiveRelay,
  getBridgeConfig,
  setBridgeConfig,
} from '../src/storage/store'

function isExtensionUiSender(url?: string): boolean {
  if (!url) return false
  return url.startsWith(browser.runtime.getURL('/'))
}

async function getApprovedActiveChatGptTab() {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  })

  if (!tab?.url || !isApprovedChatGptUrl(tab.url)) return null
  return tab
}

export default defineBackground({
  type: 'module',
  main() {
    browser.runtime.onMessage.addListener(async (message, sender) => {
      const parsed = bridgeMessageSchema.safeParse(message)
      if (!parsed.success) {
        return { ok: false, error: 'INVALID_MESSAGE' }
      }

      const fromChatGpt = isApprovedChatGptUrl(sender.url)
      const fromExtensionUi = isExtensionUiSender(sender.url)

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

      if (!fromChatGpt) {
        return { ok: false, error: 'UNAPPROVED_SENDER' }
      }

      return {
        ok: false,
        error: 'NOT_IMPLEMENTED_IN_4A',
      }
    })
  },
})
