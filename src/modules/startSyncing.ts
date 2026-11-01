import type { PGlite } from '@electric-sql/pglite'
import type {
  SyncShapesToTablesOptions,
  SyncShapesToTablesResult,
} from '@electric-sql/pglite-sync'

import {
  store,
  initialSyncingAtom,
  onlineAtom,
  pgliteDbAtom,
  syncObjectAtom,
} from '../store.ts'
import { constants } from './constants.ts'
import { fetchPostgrestToken } from './fetchPostgrestToken.ts'
import { dependencyLevels, untilUpToDate } from './syncStages.ts'
import { armSyncErrorRecovery, syncRecovered } from './syncErrorRecovery.ts'
import { shapeDefinitions } from './shapeDefinitions.mjs'

/** the aggregate sync object stored in syncObjectAtom */
export type PsSyncObject = SyncShapesToTablesResult & {
  /** every stage's snapshot has been applied (committed) locally */
  readonly isApplied: boolean
  /** a stage received up-to-date and its apply transaction is still running */
  readonly isApplying: boolean
}

// pglite-worker.ts registers electricSync() under the `electric` namespace;
// store.ts types the db atom as plain PGlite, so the namespace is re-declared here.
type ElectricDb = PGlite & {
  electric: {
    syncShapesToTables: (
      options: SyncShapesToTablesOptions,
    ) => Promise<SyncShapesToTablesResult>
  }
}

const url = constants.getElectricUri()

// Per-table row transforms; not part of the server-validated shape definition.
// change.value is the change row (see MapColumnsFn in @electric-sql/pglite-sync)
const mapColumnsByTable: Record<
  string,
  (change: { value: Record<string, unknown> }) => Record<string, unknown>
> = {
  goal_reports: (change) => ({
    goal_report_id: change.value.goal_report_id,
    goal_id: change.value.goal_id,
    label: change.value.label,
    created_at: change.value.created_at,
    updated_at: change.value.updated_at,
    updated_by: change.value.updated_by,
    data:
      !change.value.data ? '{}'
      : (
        typeof change.value.data === 'string' &&
        !change.value.data.trim().startsWith('{')
      ) ?
        JSON.stringify(change.value.data)
      : change.value.data,
  }),
}

// Bypass browser HTTP cache for shape requests so stale offset=-1 snapshots
// (which survive a site-storage clear) never cause an expired-handle replay bug
// https://github.com/electric-sql/pglite/issues/962
const noCacheFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: 'no-store' })

export const startSyncing = async (userId: string) => {
  const db = store.get(pgliteDbAtom)
  const syncStart = Date.now()

  // is syncObjectAtom exists, return
  const syncObject = store.get(syncObjectAtom)
  if (syncObject) return

  // Using persistent key for live updates across page reloads
  // On reload: shapes already exist (409 warnings), Electric resumes streaming changes
  // PGlite data persists in IndexedDB, so no need to clear or re-sync everything

  // Preflight the PostgREST JWT so Caddy's forward_auth gate on the Electric
  // endpoint accepts the shape requests. The token must be the one of THIS
  // user: the auth server rejects shapes whose params[1] is not the caller.
  const token = await fetchPostgrestToken(userId)
  if (!token) {
    throw new Error('startSyncing: no PostgREST token for the signed-in user')
  }
  // Function-valued header so every shape request resolves the CURRENT token
  // from fetchPostgrestToken's expiry-aware cache — a static header would 401
  // on every long-poll once the 1h PostgREST JWT expires (caddy forward_auth)
  const authHeaders = {
    Authorization: async () => `Bearer ${await fetchPostgrestToken(userId)}`,
  } as unknown as Record<string, string>

  try {
    // shape definitions (table, where, columns) are shared with the auth
    // server, which rejects any shape request that deviates from them
    const shapes = Object.fromEntries(
      Object.entries(shapeDefinitions).map(
        ([table, { where, columns, primaryKey }]) => [
          table,
          {
            shape: {
              url,
              params: {
                table,
                ...(columns ? { columns } : {}),
                ...(where ? { where, params: { '1': userId } } : {}),
              },
              fetchClient: noCacheFetch,
              headers: authHeaders,
            },
            table,
            primaryKey,
            ...(mapColumnsByTable[table] ?
              { mapColumns: mapColumnsByTable[table] }
            : {}),
          },
        ],
      ),
    )

    // Apply the shapes in FK-safe levels: every table's foreign-key parents
    // are subscribed and up to date before its own level starts. pglite
    // enforces the (deferred) foreign keys at every apply transaction's
    // commit, and Electric streams shapes concurrently without cross-shape
    // ordering — without the levels, a child row arriving before its parent
    // (e.g. subproject_roles before subprojects) aborts the whole initial
    // sync. Live changes are unaffected: parents exist by then, and the rare
    // same-transaction parent+child insert is caught by the FK error
    // recovery (syncErrorRecovery.ts).
    let levels: string[][] = [Object.values(shapes).map((s) => s.table)]
    try {
      levels = await dependencyLevels(
        db as PGlite,
        Object.values(shapes).map((s) => s.table),
      )
    } catch (error) {
      console.warn(
        'startSyncing: could not derive FK levels, syncing unordered',
        error,
      )
    }

    const onError = (error: unknown) => {
      const errorStr = error?.toString() || ''
      const is409 = errorStr.includes('409') || errorStr.includes('Conflict')

      if (is409) {
        // 409 = the shape handle is expired; the client library transparently
        // re-fetches the snapshot (Electric currently never resumes subquery
        // shapes incrementally). Do NOT release the boot phase here: at this
        // point a shape may still be mid-refetch (its table cleared, snapshot
        // not yet applied), and mounted live queries would read the empty
        // table and never be notified of the refill. InitialSyncManager
        // releases once every stage's snapshot is applied (isApplied).
        return
      }

      // Network disconnect — mark offline so Syncer stops sync immediately
      const isNetworkError =
        errorStr.includes('ERR_INTERNET_DISCONNECTED') ||
        errorStr.includes('Failed to fetch') ||
        errorStr.includes('NetworkError') ||
        errorStr.includes('network') ||
        error instanceof TypeError
      if (isNetworkError) {
        console.warn('Electric: network error detected, marking offline')
        store.set(onlineAtom, false)
        return
      }

      console.error('❌ Syncer error:', error)
      //  Don't set syncingAtom to false - let timeout or onInitialSync handle it
    }
    // must-refetch control messages need no handler here: pglite-sync clears
    // the shape's table and re-applies the new snapshot in one transaction

    const syncs: SyncShapesToTablesResult[] = []
    let allStagesStarted = false
    // onInitialSync fired per stage: pglite-sync calls it after the apply
    // transaction committed, whereas isUpToDate flips as soon as the stream
    // RECEIVED the up-to-date marker — possibly long before the rows exist
    const stageApplied: boolean[] = []
    // aggregate over the per-level syncs: InitialSyncManager polls
    // isApplied/isApplying, AuthAndDb and clearLocalSyncedData call unsubscribe
    const aggregate: PsSyncObject = {
      unsubscribe: () => {
        for (const sync of syncs) sync.unsubscribe()
      },
      get isUpToDate() {
        return allStagesStarted && syncs.every((sync) => sync.isUpToDate)
      },
      get isApplied() {
        return (
          allStagesStarted &&
          syncs.length === levels.length &&
          syncs.every((_, index) => stageApplied[index] === true)
        )
      },
      get isApplying() {
        return syncs.some(
          (sync, index) => sync.isUpToDate && stageApplied[index] !== true,
        )
      },
      get streams() {
        return Object.assign({}, ...syncs.map((sync) => sync.streams))
      },
    } as PsSyncObject

    armSyncErrorRecovery()

    const startStage = async (index: number) => {
      const level = levels[index]!
      const stageShapes = Object.fromEntries(
        Object.entries(shapes).filter(([, shape]) =>
          level.includes(shape.table),
        ),
      )
      const isLast = index === levels.length - 1
      const sync = await (db as ElectricDb).electric.syncShapesToTables({
        shapes: stageShapes,
        // one persistent key per level, for live updates across page reloads
        key: `ps-sync-stage-${index + 1}`,
        // fresh subscriptions bulk-load the snapshot via json_to_recordset
        // (10k rows per statement) instead of batched INSERTs; pglite-sync
        // ignores this when resuming persisted state (409 re-snapshots)
        initialInsertMethod: 'json',
        onInitialSync: async () => {
          stageApplied[index] = true
          if (!isLast) return
          console.log(
            `Initial sync done (${levels.length} stages, ${Math.round((Date.now() - syncStart) / 1000)}s)`,
          )
          store.set(initialSyncingAtom, false)
          syncRecovered()
        },
        onError,
      })

      // Validate sync object
      if (!sync || typeof sync.unsubscribe !== 'function') {
        throw new Error('Invalid sync object returned from syncShapesToTables')
      }
      syncs.push(sync)

      // a stage that has not settled after a minute is abnormal: name the
      // shapes still syncing (once), otherwise stay silent
      const stageStart = Date.now()
      const diagTimer = setInterval(() => {
        if (sync.isUpToDate) {
          clearInterval(diagTimer)
          return
        }
        if (Date.now() - stageStart < 60_000) return
        clearInterval(diagTimer)
        const pending = Object.entries(sync.streams)
          .filter(([, stream]) => !(stream as { isUpToDate?: boolean }).isUpToDate)
          .map(([name]) => name)
        console.warn(
          `startSyncing: stage ${index + 1}/${levels.length} not up to date after 60s, still syncing: ${pending.join(', ')}`,
        )
      }, 1000)
      aggregate.unsubscribe = () => {
        clearInterval(diagTimer)
        for (const sync2 of syncs) sync2.unsubscribe()
      }

      return sync
    }

    // subscribe and settle the first level before returning; the remaining
    // levels chain in the background, each gated on its parents' level
    await startStage(0)
    if (levels.length > 1) {
      void (async () => {
        for (let index = 1; index < levels.length; index++) {
          try {
            const previous = syncs[index - 1]!
            await untilUpToDate(previous, `${index}/${levels.length}`)
            await startStage(index)
          } catch (error) {
            // a hung or failed level: the later levels are not started (their
            // parents are missing). Stop the sync so Syncer restarts it from
            // the persisted stage state once the user is online again.
            console.error(`Error starting sync stage ${index + 1}:`, error)
            aggregate.unsubscribe()
            store.set(syncObjectAtom, null)
            store.set(onlineAtom, false)
            return
          }
        }
      })().finally(() => {
        allStagesStarted = true
      })
    } else {
      allStagesStarted = true
    }

    return aggregate
  } catch (error) {
    console.error('Error starting sync:', error)
    throw error
  }
}
