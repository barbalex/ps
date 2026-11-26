import { afterEach, expect, it, vi } from 'vitest'
import { startSyncing } from '../src/modules/startSyncing.ts'

const { subscribe } = vi.hoisted(() => ({
  subscribe: vi.fn(async (_options: { onInitialSync: () => void }) => ({
    isUpToDate: true, streams: {}, unsubscribe: vi.fn(),
  })),
}))

vi.mock('../src/store.ts', () => ({
  store: {
    get: (key: string) => key === 'db' ? {
      electric: { syncShapesToTables: subscribe },
      query: async () => ({ rows: [{ table_name: 'check_taxa', references_table: 'checks' }] }),
    } : null,
    set: vi.fn(),
  },
  pgliteDbAtom: 'db', syncObjectAtom: 'sync', initialSyncingAtom: 'initial',
  onlineAtom: 'online', addNotificationAtom: 'notify',
}))
vi.mock('../src/modules/constants.ts', () => ({ constants: { getElectricUri: () => '/sync' } }))
vi.mock('../src/modules/fetchPostgrestToken.ts', () => ({ requirePostgrestToken: async () => 'test' }))
vi.mock('../src/modules/syncErrorRecovery.ts', () => ({ armSyncErrorRecovery: vi.fn(), syncRecovered: vi.fn() }))
vi.mock('../src/modules/shapeDefinitions.mjs', () => ({
  shapeDefinitions: { checks: { primaryKey: ['check_id'] }, check_taxa: { primaryKey: ['check_taxon_id'] } },
}))

afterEach(() => {
  vi.useRealTimers()
  subscribe.mockClear()
})

it.each([false, true])('waits for checks to commit before subscribing to check_taxa (stopped: %s)', async stopped => {
  vi.useFakeTimers()
  const sync = await startSyncing('user')
  await vi.advanceTimersByTimeAsync(2000)
  expect(subscribe).toHaveBeenCalledTimes(1)
  expect(subscribe.mock.calls[0][0]).toMatchObject({ shapes: { checks: {} } })
  if (stopped) sync!.unsubscribe()
  subscribe.mock.calls[0][0].onInitialSync()
  await vi.advanceTimersByTimeAsync(500)
  expect(subscribe).toHaveBeenCalledTimes(stopped ? 1 : 2)
  if (!stopped) expect(subscribe.mock.calls[1][0]).toMatchObject({ shapes: { check_taxa: {} } })
  sync!.unsubscribe()
})
