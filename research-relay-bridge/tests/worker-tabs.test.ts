import { describe, expect, it } from 'vitest'
import {
  isExactWorkerEntryTab,
  selectWorkerTab,
} from '../src/navigation/worker-tabs'

const workerEntryUrl = 'https://chatgpt.com/g/g-worker/project'

describe('worker tab selection', () => {
  it('accepts only the exact registered Worker entry URL', () => {
    expect(
      isExactWorkerEntryTab(
        { id: 7, url: workerEntryUrl },
        workerEntryUrl,
      ),
    ).toBe(true)

    expect(
      isExactWorkerEntryTab(
        { id: 7, url: 'https://chatgpt.com/c/other-chat' },
        workerEntryUrl,
      ),
    ).toBe(false)
  })

  it('prefers a valid hinted tab', () => {
    const selected = selectWorkerTab(
      [
        { id: 1, url: workerEntryUrl },
        { id: 2, url: workerEntryUrl },
      ],
      workerEntryUrl,
      2,
    )

    expect(selected?.id).toBe(2)
  })

  it('falls back to another exact match when the hint is stale', () => {
    const selected = selectWorkerTab(
      [
        { id: 1, url: workerEntryUrl },
        { id: 2, url: 'https://chatgpt.com/c/not-worker-entry' },
      ],
      workerEntryUrl,
      99,
    )

    expect(selected?.id).toBe(1)
  })

  it('returns null when no exact Worker entry tab exists', () => {
    expect(
      selectWorkerTab(
        [
          { id: 1, url: 'https://chatgpt.com/c/other-chat' },
          { id: 2, url: 'https://example.com/' },
        ],
        workerEntryUrl,
      ),
    ).toBeNull()
  })
})
