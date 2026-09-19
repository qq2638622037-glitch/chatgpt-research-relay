import { describe, expect, it } from 'vitest'
import {
  InvalidRelayTransitionError,
  isTerminalState,
  transitionRelay,
} from '../src/relay/fsm'
import { RELAY_STATES, type ActiveRelay } from '../src/relay/types'

function makeRelay(): ActiveRelay {
  return {
    schemaVersion: 1,
    taskId: 'RR-20260918-ABC123',
    state: 'TASK_VALIDATED',
    masterUrl: 'https://chatgpt.com/c/master',
    workerEntryUrl: 'https://chatgpt.com/g/g-worker/project',
    taskPacket: 'protocol: research-task/v1',
    taskHash: 'abc',
    createdAt: '2026-09-18T00:00:00.000Z',
    updatedAt: '2026-09-18T00:00:00.000Z',
  }
}

describe('relay FSM', () => {
  it('follows the happy path', () => {
    let relay = makeRelay()
    for (const state of [
      'WORKER_OPENING',
      'WORKER_READY',
      'TASK_STAGED',
      'AWAITING_RESULT',
      'RESULT_VALIDATED',
      'MASTER_OPENING',
      'MASTER_READY',
      'RESULT_STAGED',
      'DONE',
    ] as const) {
      relay = transitionRelay(relay, state)
    }
    expect(relay.state).toBe('DONE')
  })

  it('rejects illegal transitions', () => {
    expect(() => transitionRelay(makeRelay(), 'DONE')).toThrow(
      InvalidRelayTransitionError,
    )
  })

  it('is idempotent when setting the current state again', () => {
    const relay = makeRelay()
    expect(transitionRelay(relay, 'TASK_VALIDATED')).toBe(relay)
  })

  it('allows manual fresh-chat recovery', () => {
    let relay = transitionRelay(makeRelay(), 'WORKER_OPENING')
    relay = transitionRelay(relay, 'NEEDS_USER_NEW_CHAT')
    relay = transitionRelay(relay, 'WORKER_READY')
    expect(relay.state).toBe('WORKER_READY')
  })

  it('allows cancellation from every non-terminal state', () => {
    for (const state of RELAY_STATES.filter((state) => !isTerminalState(state))) {
      const relay: ActiveRelay = {
        ...makeRelay(),
        state,
      }

      expect(transitionRelay(relay, 'CANCELLED').state).toBe('CANCELLED')
    }
  })
})
