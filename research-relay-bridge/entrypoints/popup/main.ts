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
      } | null
    }
  | { ok: false; error: string }

const statusEl = document.querySelector<HTMLParagraphElement>('#status')
const setWorkerButton =
  document.querySelector<HTMLButtonElement>('#set-worker')

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

  statusEl.textContent = `${worker}\n${relay}`
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
