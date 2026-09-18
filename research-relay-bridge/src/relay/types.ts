export const RELAY_STATES = [
  'TASK_VALIDATED',
  'WORKER_OPENING',
  'WORKER_READY',
  'TASK_STAGED',
  'AWAITING_RESULT',
  'RESULT_VALIDATED',
  'MASTER_OPENING',
  'MASTER_READY',
  'RESULT_STAGED',
  'NEEDS_USER_NEW_CHAT',
  'ERROR_RECOVERABLE',
  'DONE',
  'CANCELLED',
] as const

export type RelayState = (typeof RELAY_STATES)[number]

export const RELAY_ERROR_CODES = [
  'WORKER_NOT_CONFIGURED',
  'INVALID_TASK_YAML',
  'INVALID_TASK_SCHEMA',
  'ACTIVE_RELAY_CONFLICT',
  'WORKER_OPEN_FAILED',
  'ADAPTER_UNHEALTHY',
  'FRESH_CHAT_NOT_VERIFIED',
  'COMPOSER_NOT_FOUND',
  'COMPOSER_NOT_EMPTY',
  'TASK_STAGE_FAILED',
  'POSTED_TASK_INVALID',
  'POSTED_TASK_ID_MISMATCH',
  'RESULT_SCHEMA_INVALID',
  'RESULT_TASK_ID_MISMATCH',
  'MASTER_OPEN_FAILED',
  'RESULT_STAGE_FAILED',
  'POSTED_RESULT_INVALID',
  'STORAGE_READ_FAILED',
  'STORAGE_WRITE_FAILED',
] as const

export type RelayErrorCode = (typeof RELAY_ERROR_CODES)[number]

export interface RelayError {
  code: RelayErrorCode
  stage: RelayState | 'VALIDATION' | 'ADAPTER'
  message: string
  recoverable: boolean
  occurredAt: string
  locatorAttempts?: string[]
}

export interface BridgeConfig {
  schemaVersion: 1
  workerEntryUrl?: string
  configuredAt?: string
}

export interface ActiveRelay {
  schemaVersion: 1
  taskId: string
  state: RelayState
  masterUrl: string
  workerEntryUrl: string
  workerChatUrl?: string
  taskPacket: string
  taskHash: string
  resultEnvelope?: string
  resultHash?: string
  createdAt: string
  updatedAt: string
  masterTabIdHint?: number
  workerTabIdHint?: number
  lastError?: RelayError
}

export interface RelayHistoryItem {
  taskId: string
  terminalState: 'DONE' | 'CANCELLED'
  completedAt: string
  lastErrorCode?: string
}
