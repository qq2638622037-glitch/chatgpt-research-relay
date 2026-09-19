import { browser } from 'wxt/browser'

type GetStateResponse =
  | {
      ok: true
      config: {
        schemaVersion: 1
        workerEntryUrl?: string
        configuredAt?: string
      }
      activeRelay: {
        taskId: string
        state: string
        workerContextVerifiedAt?: string
        workerObservedUrl?: string
        workerAdapterVersion?: number
        lastError?: {
          code: string
          message: string
        }
      } | null
    }
  | { ok: false; error: string }

const statusEl = document.querySelector<HTMLParagraphElement>('#status')
const setWorkerButton =
  document.querySelector<HTMLButtonElement>('#set-worker')
const cancelRelayButton =
  document.querySelector<HTMLButtonElement>('#cancel-relay')

function renderStatus(response: GetStateResponse) {
  if (!statusEl) return

  if (!response.ok) {
    statusEl.textContent = `Error: ${response.error}`
    return
  }

  const worker = response.config.workerEntryUrl
    ? 'Worker project configured'
    : 'Worker project not configured'

  const relay = response.activeRelay
    ? `Active relay: ${response.activeRelay.taskId} · ${response.activeRelay.state}`
    : 'No active relay'

  let workerContext = ''
  if (response.activeRelay?.workerContextVerifiedAt) {
    workerContext = '\nWorker adapter/context: verified'
  } else if (response.activeRelay?.lastError?.code === 'ADAPTER_UNHEALTHY') {
    workerContext = `\nWorker adapter/context: blocked · ${response.activeRelay.lastError.code}`
  } else if (response.activeRelay?.state === 'WORKER_OPENING') {
    workerContext = '\nWorker adapter/context: pending'
  }

  statusEl.textContent = `${worker}\n${relay}${workerContext}`
}

async function refresh() {
  const response = (await browser.runtime.sendMessage({
    type: 'GET_STATE',
  })) as GetStateResponse

  renderStatus(response)
}

setWorkerButton?.addEventListener('click', async () => {
  if (statusEl) statusEl.textContent = 'Registering current ChatGPT page…'

  const response = (await browser.runtime.sendMessage({
    type: 'SET_WORKER_ENTRY_CURRENT_TAB',
  })) as { ok: boolean; error?: string }

  if (!response.ok) {
    if (statusEl) {
      statusEl.textContent =
        response.error === 'ACTIVE_TAB_NOT_CHATGPT'
          ? 'Open the intended Research Worker Project in ChatGPT, then try again.'
          : `Registration failed: ${response.error ?? 'unknown error'}`
    }
    return
  }

  await refresh()
})

void refresh()

cancelRelayButton?.addEventListener('click', async () => {
  if (statusEl) statusEl.textContent = 'Cancelling active relay…'

  const response = (await browser.runtime.sendMessage({
    type: 'CANCEL_RELAY',
  })) as { ok: boolean; error?: string; taskId?: string }

  if (!response.ok) {
    if (statusEl) {
      statusEl.textContent =
        response.error === 'NO_ACTIVE_RELAY'
          ? 'No active relay'
          : `Cancel failed: ${response.error ?? 'unknown error'}`
    }
    return
  }

  await refresh()
})
