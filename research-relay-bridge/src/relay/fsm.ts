import type { ActiveRelay, RelayState } from './types'

const transitions: Record<RelayState, readonly RelayState[]> = {
  TASK_VALIDATED: ['WORKER_OPENING', 'ERROR_RECOVERABLE', 'CANCELLED'],
  WORKER_OPENING: [
    'WORKER_READY',
    'NEEDS_USER_NEW_CHAT',
    'ERROR_RECOVERABLE',
    'CANCELLED',
  ],
  WORKER_READY: [
    'TASK_STAGED',
    'NEEDS_USER_NEW_CHAT',
    'ERROR_RECOVERABLE',
    'CANCELLED',
  ],
  TASK_STAGED: ['AWAITING_RESULT', 'ERROR_RECOVERABLE', 'CANCELLED'],
  AWAITING_RESULT: ['RESULT_VALIDATED', 'ERROR_RECOVERABLE', 'CANCELLED'],
  RESULT_VALIDATED: ['MASTER_OPENING', 'ERROR_RECOVERABLE', 'CANCELLED'],
  MASTER_OPENING: ['MASTER_READY', 'ERROR_RECOVERABLE', 'CANCELLED'],
  MASTER_READY: ['RESULT_STAGED', 'ERROR_RECOVERABLE', 'CANCELLED'],
  RESULT_STAGED: ['DONE', 'ERROR_RECOVERABLE', 'CANCELLED'],
  NEEDS_USER_NEW_CHAT: ['WORKER_READY', 'ERROR_RECOVERABLE', 'CANCELLED'],
  ERROR_RECOVERABLE: [
    'WORKER_OPENING',
    'WORKER_READY',
    'TASK_STAGED',
    'AWAITING_RESULT',
    'MASTER_OPENING',
    'MASTER_READY',
    'RESULT_STAGED',
    'CANCELLED',
  ],
  DONE: [],
  CANCELLED: [],
}

export class InvalidRelayTransitionError extends Error {
  constructor(from: RelayState, to: RelayState) {
    super(`Illegal relay transition: ${from} -> ${to}`)
    this.name = 'InvalidRelayTransitionError'
  }
}

export function canTransition(from: RelayState, to: RelayState): boolean {
  return transitions[from].includes(to)
}

export function transitionRelay(
  relay: ActiveRelay,
  to: RelayState,
  now = new Date().toISOString(),
): ActiveRelay {
  if (relay.state === to) return relay
  if (!canTransition(relay.state, to)) {
    throw new InvalidRelayTransitionError(relay.state, to)
  }

  return {
    ...relay,
    state: to,
    updatedAt: now,
  }
}

export function isTerminalState(state: RelayState): boolean {
  return state === 'DONE' || state === 'CANCELLED'
}
