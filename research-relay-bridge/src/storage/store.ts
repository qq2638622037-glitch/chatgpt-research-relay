import { storage } from '@wxt-dev/storage'
import type {
  ActiveRelay,
  BridgeConfig,
  RelayHistoryItem,
} from '../relay/types'

const configItem = storage.defineItem<BridgeConfig>('local:bridgeConfig', {
  fallback: { schemaVersion: 1 },
})

const activeRelayItem = storage.defineItem<ActiveRelay | null>(
  'local:activeRelay',
  { fallback: null },
)

const historyItem = storage.defineItem<RelayHistoryItem[]>('local:relayHistory', {
  fallback: [],
})

export async function getBridgeConfig(): Promise<BridgeConfig> {
  return configItem.getValue()
}

export async function setBridgeConfig(config: BridgeConfig): Promise<void> {
  await configItem.setValue(config)
}

export async function getActiveRelay(): Promise<ActiveRelay | null> {
  return activeRelayItem.getValue()
}

export async function setActiveRelay(relay: ActiveRelay | null): Promise<void> {
  await activeRelayItem.setValue(relay)
}

export async function addTerminalHistory(
  item: RelayHistoryItem,
): Promise<void> {
  const current = await historyItem.getValue()
  await historyItem.setValue([item, ...current].slice(0, 20))
}

export async function clearAllBridgeStorage(): Promise<void> {
  await Promise.all([
    configItem.removeValue(),
    activeRelayItem.removeValue(),
    historyItem.removeValue(),
  ])
}
