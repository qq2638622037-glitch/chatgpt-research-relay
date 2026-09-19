import { hashProtocolText } from '../protocol/hash'
import { validateTaskPacket } from '../protocol/validate'
import {
  addTerminalHistory,
  getActiveRelay,
  getBridgeConfig,
  setActiveRelay,
} from '../storage/store'
import { isTerminalState } from './fsm'
import type { ActiveRelay } from './types'

let writeQueue: Promise<void> = Promise.resolve()

function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation, operation)
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}

export type StartRelayResult =
  | {
      ok: true
      taskId: string
      state: ActiveRelay['state']
      alreadyActive: boolean
    }
  | {
      ok: false
      error:
        | 'INVALID_TASK_YAML'
        | 'INVALID_TASK_SCHEMA'
        | 'WORKER_NOT_CONFIGURED'
        | 'ACTIVE_RELAY_CONFLICT'
      activeTaskId?: string
      validationErrors?: Array<{ path: string; message: string }>
    }

export async function startRelay(params: {
  rawTask: string
  masterUrl: string
  masterTabIdHint?: number
}): Promise<StartRelayResult> {
  return serialize(async () => {
    const validation = validateTaskPacket(params.rawTask)

    if (!validation.valid || !validation.value) {
      const yamlError = validation.errors.some((issue) => issue.path === '$')
      return {
        ok: false,
        error: yamlError ? 'INVALID_TASK_YAML' : 'INVALID_TASK_SCHEMA',
        validationErrors: validation.errors,
      }
    }

    const config = await getBridgeConfig()
    if (!config.workerEntryUrl) {
      return { ok: false, error: 'WORKER_NOT_CONFIGURED' }
    }

    const taskHash = await hashProtocolText(params.rawTask)
    const existing = await getActiveRelay()

    if (existing && !isTerminalState(existing.state)) {
      if (
        existing.taskId === validation.value.task_id &&
        existing.taskHash === taskHash
      ) {
        return {
          ok: true,
          taskId: existing.taskId,
          state: existing.state,
          alreadyActive: true,
        }
      }

      return {
        ok: false,
        error: 'ACTIVE_RELAY_CONFLICT',
        activeTaskId: existing.taskId,
      }
    }

    const now = new Date().toISOString()
    const relay: ActiveRelay = {
      schemaVersion: 1,
      taskId: validation.value.task_id,
      state: 'TASK_VALIDATED',
      masterUrl: params.masterUrl,
      workerEntryUrl: config.workerEntryUrl,
      taskPacket: params.rawTask,
      taskHash,
      createdAt: now,
      updatedAt: now,
      masterTabIdHint: params.masterTabIdHint,
    }

    await setActiveRelay(relay)

    return {
      ok: true,
      taskId: relay.taskId,
      state: relay.state,
      alreadyActive: false,
    }
  })
}

export type CancelRelayResult =
  | {
      ok: true
      cancelled: boolean
      taskId?: string
    }
  | {
      ok: false
      error: 'NO_ACTIVE_RELAY'
    }

export async function cancelRelay(): Promise<CancelRelayResult> {
  return serialize(async () => {
    const existing = await getActiveRelay()

    if (!existing || isTerminalState(existing.state)) {
      return { ok: false, error: 'NO_ACTIVE_RELAY' }
    }

    await addTerminalHistory({
      taskId: existing.taskId,
      terminalState: 'CANCELLED',
      completedAt: new Date().toISOString(),
      lastErrorCode: existing.lastError?.code,
    })

    await setActiveRelay(null)

    return {
      ok: true,
      cancelled: true,
      taskId: existing.taskId,
    }
  })
}
