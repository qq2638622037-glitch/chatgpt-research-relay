import { describe, expect, it } from 'vitest'
import {
  probeWorkerContextWithRetry,
  verifyWorkerContextProbe,
  WORKER_ADAPTER_VERSION,
} from '../src/adapters/chatgpt/worker-context'

const workerEntryUrl = 'https://chatgpt.com/g/g-worker/project'

function healthyProbe(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    adapter: 'chatgpt',
    adapterVersion: WORKER_ADAPTER_VERSION,
    observedUrl: workerEntryUrl,
    readyState: 'complete',
    ...overrides,
  }
}

describe('Worker adapter/context verification', () => {
  it('accepts a healthy adapter on the exact registered Worker entry URL', () => {
    expect(verifyWorkerContextProbe(healthyProbe(), workerEntryUrl)).toEqual({
      ok: true,
      observedUrl: workerEntryUrl,
      adapterVersion: WORKER_ADAPTER_VERSION,
    })
  })

  it('rejects another ChatGPT route even when the origin matches', () => {
    const result = verifyWorkerContextProbe(
      healthyProbe({
        observedUrl: 'https://chatgpt.com/c/old-worker-chat',
      }),
      workerEntryUrl,
    )

    expect(result).toEqual({
      ok: false,
      reason: 'Worker Project context does not match the registered Worker entry URL',
    })
  })

  it('rejects malformed or incomplete adapter responses', () => {
    expect(
      verifyWorkerContextProbe(
        {
          ok: true,
          adapter: 'chatgpt',
          adapterVersion: WORKER_ADAPTER_VERSION,
          observedUrl: workerEntryUrl,
          readyState: 'loading',
        },
        workerEntryUrl,
      ),
    ).toEqual({
      ok: false,
      reason: 'Worker adapter returned an invalid health response',
    })
  })

  it('retries until a healthy exact-context response arrives', async () => {
    let attempts = 0

    const result = await probeWorkerContextWithRetry({
      expectedWorkerEntryUrl: workerEntryUrl,
      maxAttempts: 4,
      attemptTimeoutMs: 50,
      retryDelayMs: 0,
      probe: async () => {
        attempts += 1
        if (attempts < 3) throw new Error('content script not ready')
        return healthyProbe()
      },
    })

    expect(result).toEqual({
      ok: true,
      observedUrl: workerEntryUrl,
      adapterVersion: WORKER_ADAPTER_VERSION,
      attempts: 3,
    })
    expect(attempts).toBe(3)
  })

  it('stops after the configured number of failed attempts', async () => {
    let attempts = 0

    const result = await probeWorkerContextWithRetry({
      expectedWorkerEntryUrl: workerEntryUrl,
      maxAttempts: 3,
      attemptTimeoutMs: 50,
      retryDelayMs: 0,
      probe: async () => {
        attempts += 1
        throw new Error('content script unavailable')
      },
    })

    expect(result).toEqual({
      ok: false,
      reason: 'content script unavailable',
      attempts: 3,
    })
    expect(attempts).toBe(3)
  })

  it('bounds a probe that never resolves', async () => {
    const result = await probeWorkerContextWithRetry({
      expectedWorkerEntryUrl: workerEntryUrl,
      maxAttempts: 1,
      attemptTimeoutMs: 10,
      retryDelayMs: 0,
      probe: () => new Promise<unknown>(() => undefined),
    })

    expect(result).toEqual({
      ok: false,
      reason: 'Worker adapter probe timed out',
      attempts: 1,
    })
  })
})
