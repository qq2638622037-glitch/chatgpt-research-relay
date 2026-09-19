import { z } from 'zod'
import { isApprovedChatGptUrl } from '../../messaging/messages'

export const WORKER_CONTEXT_PROBE_TYPE = 'WORKER_CONTEXT_PROBE' as const
export const WORKER_ADAPTER_VERSION = 1 as const

const DEFAULT_MAX_ATTEMPTS = 12
const DEFAULT_ATTEMPT_TIMEOUT_MS = 800
const DEFAULT_RETRY_DELAY_MS = 350

export const workerContextProbeRequestSchema = z
  .object({
    type: z.literal(WORKER_CONTEXT_PROBE_TYPE),
  })
  .strict()

export const workerContextProbeResponseSchema = z
  .object({
    ok: z.literal(true),
    adapter: z.literal('chatgpt'),
    adapterVersion: z.literal(WORKER_ADAPTER_VERSION),
    observedUrl: z.string().url(),
    readyState: z.enum(['interactive', 'complete']),
  })
  .strict()

export type WorkerContextProbeResponse = z.infer<
  typeof workerContextProbeResponseSchema
>

export type WorkerContextVerification =
  | {
      ok: true
      observedUrl: string
      adapterVersion: typeof WORKER_ADAPTER_VERSION
    }
  | {
      ok: false
      reason: string
    }

export function verifyWorkerContextProbe(
  value: unknown,
  expectedWorkerEntryUrl: string,
): WorkerContextVerification {
  if (!isApprovedChatGptUrl(expectedWorkerEntryUrl)) {
    return {
      ok: false,
      reason: 'Expected Worker entry URL is not an approved ChatGPT URL',
    }
  }

  const parsed = workerContextProbeResponseSchema.safeParse(value)
  if (!parsed.success) {
    return {
      ok: false,
      reason: 'Worker adapter returned an invalid health response',
    }
  }

  if (!isApprovedChatGptUrl(parsed.data.observedUrl)) {
    return {
      ok: false,
      reason: 'Worker adapter reported an unapproved URL',
    }
  }

  if (parsed.data.observedUrl !== expectedWorkerEntryUrl) {
    return {
      ok: false,
      reason: 'Worker Project context does not match the registered Worker entry URL',
    }
  }

  return {
    ok: true,
    observedUrl: parsed.data.observedUrl,
    adapterVersion: parsed.data.adapterVersion,
  }
}

export interface WorkerContextProbeRetryOptions {
  expectedWorkerEntryUrl: string
  probe: () => Promise<unknown>
  maxAttempts?: number
  attemptTimeoutMs?: number
  retryDelayMs?: number
  sleep?: (ms: number) => Promise<void>
}

export type WorkerContextProbeRetryResult =
  | (Extract<WorkerContextVerification, { ok: true }> & {
      attempts: number
    })
  | {
      ok: false
      reason: string
      attempts: number
    }

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown Worker adapter failure'
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('Worker adapter probe timed out')),
          timeoutMs,
        )
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export async function probeWorkerContextWithRetry(
  options: WorkerContextProbeRetryOptions,
): Promise<WorkerContextProbeRetryResult> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS
  const attemptTimeoutMs =
    options.attemptTimeoutMs ?? DEFAULT_ATTEMPT_TIMEOUT_MS
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS
  const sleep =
    options.sleep ??
    ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new Error('maxAttempts must be a positive integer')
  }
  if (attemptTimeoutMs < 1) {
    throw new Error('attemptTimeoutMs must be positive')
  }
  if (retryDelayMs < 0) {
    throw new Error('retryDelayMs must not be negative')
  }

  let lastReason = 'Worker adapter probe failed'

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await withTimeout(options.probe(), attemptTimeoutMs)
      const verified = verifyWorkerContextProbe(
        response,
        options.expectedWorkerEntryUrl,
      )

      if (verified.ok) {
        return {
          ...verified,
          attempts: attempt,
        }
      }

      lastReason = verified.reason
    } catch (error) {
      lastReason = describeError(error)
    }

    if (attempt < maxAttempts && retryDelayMs > 0) {
      await sleep(retryDelayMs)
    }
  }

  return {
    ok: false,
    reason: lastReason,
    attempts: maxAttempts,
  }
}
