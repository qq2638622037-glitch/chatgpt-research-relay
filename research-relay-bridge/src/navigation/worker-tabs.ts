export interface WorkerTabCandidate {
  id?: number
  url?: string
}

export function isExactWorkerEntryTab(
  tab: WorkerTabCandidate,
  workerEntryUrl: string,
): boolean {
  return tab.id != null && tab.url === workerEntryUrl
}

export function selectWorkerTab<T extends WorkerTabCandidate>(
  tabs: readonly T[],
  workerEntryUrl: string,
  hintedTabId?: number,
): T | null {
  if (hintedTabId != null) {
    const hinted = tabs.find(
      (tab) =>
        tab.id === hintedTabId && isExactWorkerEntryTab(tab, workerEntryUrl),
    )
    if (hinted) return hinted
  }

  return (
    tabs.find((tab) => isExactWorkerEntryTab(tab, workerEntryUrl)) ?? null
  )
}
