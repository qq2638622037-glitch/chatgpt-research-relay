import { bridgeMessageSchema, isApprovedChatGptUrl } from '../src/messaging/messages'
import {
  getActiveRelay,
  getBridgeConfig,
  setBridgeConfig,
} from '../src/storage/store'

export default defineBackground({
  type: 'module',
  main() {
    browser.runtime.onMessage.addListener(async (message, sender) => {
      if (!isApprovedChatGptUrl(sender.url)) {
        return { ok: false, error: 'UNAPPROVED_SENDER' }
      }

      const parsed = bridgeMessageSchema.safeParse(message)
      if (!parsed.success) {
        return { ok: false, error: 'INVALID_MESSAGE' }
      }

      switch (parsed.data.type) {
        case 'GET_STATE':
          return {
            ok: true,
            config: await getBridgeConfig(),
            activeRelay: await getActiveRelay(),
          }

        case 'SET_WORKER_ENTRY':
          await setBridgeConfig({
            schemaVersion: 1,
            workerEntryUrl: parsed.data.url,
            configuredAt: new Date().toISOString(),
          })
          return { ok: true }

        default:
          return {
            ok: false,
            error: 'NOT_IMPLEMENTED_IN_4A',
          }
      }
    })
  },
})
