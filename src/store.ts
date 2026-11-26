import { createStore, atom } from 'jotai'
import type { Atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import type { IntlShape } from 'react-intl'
import type { PGlite } from '@electric-sql/pglite'
import type { PostgrestClient } from '@supabase/postgrest-js'
import type { LatLngBoundsExpression } from 'leaflet'
import { constants } from './modules/constants.ts'
import { v7 as uuidv7 } from 'uuid'
import { checkWritePermission } from './modules/checkWritePermission.ts'
import { inferPkColumn } from './modules/inferPkColumn.ts'
import {
  initOperationAggregation,
  registerAggregatedUpdate,
  flushAggregatedUpdates,
  isAggregatableUpdate,
} from './modules/operationAggregation.ts'
// import { atom } from 'jotai'

export const store = createStore()

// queued write operations, sent to the server by observeOperations
export type OperationKind =
  | 'update'
  | 'upsert'
  | 'upsertMany'
  | 'insert'
  | 'insertMany'
  | 'delete'
  | 'deleteAll'

export interface OperationFilter {
  function: 'eq' | 'neq' | 'in'
  column: string
  value: unknown
}

export interface QueuedOperation {
  id: string
  time: string
  table: string
  operation: OperationKind
  rowIdName?: string
  rowId?: string | number
  filter?: OperationFilter
  // multiple AND conditions
  filters?: OperationFilter[]
  column?: string
  newValue?: unknown
  draft?: Record<string, unknown> | Record<string, unknown>[]
  prev?: Record<string, unknown>
}

export interface AppNotification {
  id: string
  time: number
  duration: number
  intent: 'success' | 'error' | 'warning' | 'info'
  dismissable: boolean
  allDismissable: boolean
  title?: string
  body?: string
  paused?: boolean
  progress?: number
}

export interface ViewportBounds {
  swLat: number
  swLng: number
  neLat: number
  neLng: number
}

export interface MapInfoLayer {
  label: string
  projectId?: string
  formActive?: boolean
  featureLabel?: string
  properties: [string, unknown][]
  ownTable?: 'place' | 'check' | 'action'
  ownId?: string
  ownPlaceId?: string
  ownSubprojectId?: string
  ownObservationId?: string
  ownParentId?: string
}

export interface MapInfo {
  browsing?: boolean
  lat: number
  lng: number
  zoom: number
  layers: MapInfoLayer[]
}

export interface PlaceToAssign {
  place_id: string
  label: string | null
  /** distance in meters, 0 if the dropped location lies within the place */
  distance: number
}

export interface PlacesToAssignObservationTo {
  observation_id: string
  latLng: { lat: number; lng: number }
  places: PlaceToAssign[]
  current_place_id: string | null
}

// nav stuff

export const enforceDesktopNavigationAtom = atomWithStorage(
  'enforceDesktopNavigation',
  false,
)
export const writeEnforceDesktopNavigationAtom = atom(
  (get) => get(enforceDesktopNavigationAtom),
  (_get, set, enforce) => {
    if (enforce) {
      set(enforceDesktopNavigationAtom, true)
      set(enforceMobileNavigationAtom, false)
      set(isDesktopViewAtom, true)
      return
    }
    set(enforceDesktopNavigationAtom, false)
    const isNowDesktopView = window.innerWidth >= constants.mobileViewMaxWidth
    set(isDesktopViewAtom, isNowDesktopView)
    return
  },
)
export const enforceMobileNavigationAtom = atomWithStorage(
  'enforceMobileNavigation',
  false,
)
export const writeEnforceMobileNavigationAtom = atom(
  (get) => get(enforceMobileNavigationAtom),
  (_get, set, enforce) => {
    if (enforce) {
      set(enforceMobileNavigationAtom, true)
      set(enforceDesktopNavigationAtom, false)
      set(isDesktopViewAtom, false)
      return
    }
    set(enforceMobileNavigationAtom, false)
    const isNowDesktopView = window.innerWidth >= constants.mobileViewMaxWidth
    set(isDesktopViewAtom, isNowDesktopView)
    return
  },
)
export const isDesktopViewAtom = atomWithStorage(
  'isDesktopView',
  false,
  undefined,
  // getOnInit: read localStorage synchronously so the very first render
  // already knows the view mode (isMobileViewAtom derives from this)
  { getOnInit: true },
)
export const setDesktopViewAtom = atom(
  (get) => get(isDesktopViewAtom),
  (get, set, width: number) => {
    const isDesktopView = get(isDesktopViewAtom)
    const mobileEnforced = get(enforceMobileNavigationAtom)
    const desktopEnforced = get(enforceDesktopNavigationAtom)
    if (mobileEnforced) {
      if (isDesktopView) set(isDesktopViewAtom, false)
      return
    }
    if (desktopEnforced) {
      if (!isDesktopView) set(isDesktopViewAtom, true)
      return
    }
    const isNowDesktopView = width >= constants.mobileViewMaxWidth
    if (isNowDesktopView === isDesktopView) return
    set(isDesktopViewAtom, isNowDesktopView)
  },
)

export const isMobileViewAtom = atom(
  (get) => !get(isDesktopViewAtom) || get(enforceMobileNavigationAtom),
)
export const docsReturnUrlAtom = atom<string | null>(null)

export const hideBookmarksAtom = atom((get) => {
  const isDesktopView = get(isDesktopViewAtom)
  const enforceMobileNavigation = get(enforceMobileNavigationAtom)
  const hideBookmarks = isDesktopView && !enforceMobileNavigation
  return hideBookmarks
})
export const showBookmarksMenuAtom = atomWithStorage('showBookmarksMenu', false)
export const alwaysShowTreeAtom = atomWithStorage('alwaysShowTree', false)
export const hideTreeAtom = atom((get) => {
  const alwaysShowTree = get(alwaysShowTreeAtom)
  const isMobileView = get(isMobileViewAtom)
  const hideTree = !alwaysShowTree && isMobileView
  return hideTree
})
export const showTreeMenusAtom = atom((get) => {
  // always show tree menus on desktop
  const isDesktopView = get(isDesktopViewAtom)
  // always show tree menus on mobile if alwaysShowTree is set
  const alwaysShowTree = get(alwaysShowTreeAtom)
  // always show tree menus if context menus are hidden i.e. on coarse pointer devices. NOPE
  // const contextMenusAreHidden = matchMedia('(pointer: coarse)').matches
  const showTreeMenus = isDesktopView || alwaysShowTree

  return showTreeMenus
})

export const userIdAtom = atomWithStorage<string | null>(
  'userIdAtom',
  null,
  undefined,
  { getOnInit: true },
)
export const userEmailAtom = atomWithStorage<string | null>(
  'userEmailAtom',
  null,
  undefined,
  { getOnInit: true },
)
// Non-persisted flag: reset to false on every page load. Set to true once
// getSession has been verified successfully so subsequent navigations skip
// the network round-trip.
export const sessionVerifiedAtom = atom(false)
export const isAppAmin = atom(false)
export const designingAtom = atomWithStorage<Record<string, boolean>>(
  'designingAtom',
  {},
  undefined,
  { getOnInit: true },
)
// per-project read of the designing flag: subscribing to the whole record
// re-rendered every subscriber whenever ANY project's flag changed. The
// derived atoms return a boolean, so subscribers only re-render when their
// own project's flag flips.
const _isDesigningAtoms = new Map<string, Atom<boolean>>()
export const isDesigningAtom = (projectId: string): Atom<boolean> => {
  let a = _isDesigningAtoms.get(projectId)
  if (!a) {
    a = atom((get) => get(designingAtom)[projectId] ?? false)
    _isDesigningAtoms.set(projectId, a)
  }
  return a
}
// the mobile navigation shows a single tab at a time, in this priority
export const MOBILE_TAB_PRIORITY = ['data', 'map', 'tree'] as const

export const pickMobileTab = (tabs: string[]) => {
  for (const tab of MOBILE_TAB_PRIORITY) {
    if (tabs.includes(tab)) return tab
  }
  return 'data'
}

export const tabsAtom = atomWithStorage(
  'tabsAtom',
  ['tree', 'data'],
  undefined,
  // getOnInit: read localStorage synchronously so the very first render
  // already uses the stored tabs instead of the desktop default
  { getOnInit: true },
)
// On mobile view only one tab is active at a time. Deriving the effective
// tabs at read time (instead of only compacting tabsAtom in an effect after
// mount) keeps the toggle buttons and the rendered panes consistent from the
// very first render: jotai misses store writes that happen between a
// component's first render and its subscribe (see LayoutProtected comment),
// so a mount-effect compaction left Main rendering a stale tree pane.
// Pure function (also used with url-provided panes, see
// modules/useUrlPanes.ts).
export const effectiveTabsOf = (
  tabs: string[],
  isMobileView: boolean,
  enforceMobileNavigation: boolean,
) => {
  const isNarrowViewport =
    typeof window !== 'undefined' &&
    window.innerWidth < constants.mobileViewMaxWidth
  const useSingleMobileTab =
    isMobileView && (isNarrowViewport || enforceMobileNavigation)
  return useSingleMobileTab ? [pickMobileTab(tabs)] : tabs
}
export type TableRowFilter = Record<string, unknown>
// list filters no longer live in atoms: they are url search params, see
// modules/useUrlFilter.ts (`f-<key>` params, e.g. `?f-checks1=[…]`)

// filtered counts for the qcs/exports run pages — ephemeral derived values
// written by the run pages for their header badges (the filter values
// themselves are url search params, see modules/useUrlSearchParam.ts)
export const qcsRunFilteredCountAtom = atom<number | null>(null)
export const rootQcsRunFilteredCountAtom = atom<number | null>(null)
export const projectQcsRunFilteredCountAtom = atom<number | null>(null)
export const rootExportsRunFilteredCountAtom = atom<number | null>(null)
export const projectExportsRunFilteredCountAtom = atom<number | null>(null)
export const subprojectExportsRunFilteredCountAtom = atom<number | null>(null)

const SUPPORTED_LANGUAGES = ['en', 'de', 'fr', 'it'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]
const _navLang = navigator.language.split('-')[0] as Language
const _defaultLanguage: Language =
  SUPPORTED_LANGUAGES.includes(_navLang) ? _navLang : 'de'
export const languageAtom = atomWithStorage<Language>(
  'language',
  _defaultLanguage,
  undefined,
  // getOnInit: read localStorage synchronously so the very first render
  // already uses the stored language instead of flashing the default
  { getOnInit: true },
)
export const intlAtom = atom<IntlShape | null>(null)

// 'system' follows the OS prefers-color-scheme preference (the default),
// 'light' and 'dark' force a mode. index.html resolves the same storage key
// before first paint to set html[data-theme] without a flash.
export type ThemeMode = 'system' | 'light' | 'dark'
export const themeModeAtom = atomWithStorage<ThemeMode>(
  'themeMode',
  'system',
  undefined,
  { getOnInit: true },
)

// initialSyncing gates the boot UI on every page load. It must NOT be
// persisted: Electric can clear and re-snapshot shape tables at any point
// while shapes are not yet up-to-date, and live queries get no change
// notifications for sync writes (the session runs in replica mode, which
// disables the live extension's notify triggers). A persisted "false" from a
// previous page load releases the UI into that window, where queries mount,
// read an empty table once, and then never learn the data came back.
// Released by InitialSyncManager once this load's sync is up-to-date.
export const initialSyncingAtom = atom(true)
// begins true on every page load, is set to false by SqlInitializer once the
// schema exists / has been healed — also per-load, for the same reason
export const sqlInitializingAtom = atom(true)

// true only while the local database is being created for the very first
// time this page load (schema didn't exist yet). Not persisted: on reloads
// of an existing database the boot UI stays a plain spinner instead of the
// "Building local database" card.
export const firstRunDbInitAtom = atom(false)

// stores the sync object returned from startSyncing() so we can unsubscribe on unload
export const syncObjectAtom = atom<unknown>(null)

// true when this tab is the PGlite worker leader and therefore the only tab
// running the Electric shape streams (see modules/syncLeader.ts)
export const syncLeaderAtom = atom(true)

// true while the shape streams must stay stopped: a bulk upload of a whole
// project (dump import) would otherwise stream its rows back piecemeal, in
// no cross-stage order, and the child-before-parent applies abort the sync.
// Syncer restarts the staged sync when the pause ends.
export const syncPausedAtom = atom(false)

// true while a post-boot sync is applying a sustained amount of data (shapes
// not up-to-date for several seconds) — see BackgroundSyncIndicator. Not
// persisted: meaningless across page loads.
export const backgroundSyncingAtom = atom(false)

// NB: which services were already capability-fetched (AutoFetchCapabilities)
// moved from localStorage atoms into the local-only _ps_local_meta table —
// per-service marker rows wipe with the database on logout

export const setSqlInitializingFalseAfterTimeoutAtom = atom(
  null,
  (_get, set) => {
    setTimeout(() => {
      set(sqlInitializingAtom, false)
    }, 200)
  },
)

export const mapMaximizedAtom = atomWithStorage('mapMaximizedAtom', false)
// bounds are used for setting the map view to a specific area. They are set as an object with keys: swLat, swLng, neLat, neLng
// This is a command atom - not persisted because once fitBounds is applied, the result is saved via mapCenterAtom/mapZoomAtom
export const mapBoundsAtom = atom<LatLngBoundsExpression | null>(null)
// is used for:
// - Making WFS requests with bbox parameters to fetch features within the visible map area
// - Any spatial queries that need to know what's currently visible
export const mapViewportBoundsAtom = atom<ViewportBounds | null>(null)
// center and zoom are used to set the map view to a specific center and zoom level. They are set as [lat, lng] and number respectively
export const mapCenterAtom = atomWithStorage('mapCenter', [47.4, 8.65])
export const mapZoomAtom = atomWithStorage('mapZoom', 13)

// map of id (layer.id, key) and show boolean
export const showLocalMapAtom = atomWithStorage('showLocalMapAtom', false)
// NB: the former localMapValuesAtom (layer visibility per id) was dead
// state and has been removed; clearLocalSyncedData still clears the stale
// localStorage key for users who have it persisted
export const mapHideUiAtom = atomWithStorage('mapHideUiAtom', false)
export const mapLocateAtom = atomWithStorage('mapLocateAtom', false)
// TODO:
// new structure for map_info
// Goal: enable setting from onEachFeature for wfs layers and maybe own layers
// SINGLE object with keys:
// - lat
// - lng
// - zoom
// - layers. This is an array of objects with keys: label, properties
// With this structure, wms and wfs can set their layer data into such an object, then add the object to the existing in mapInfoAtom
// mapInfoAtom is reset when user closes info window, so memory is not wasted
// the info drawer filters all the objects with correct lat, lng and zoom and shows them
// Information presented, when user clicks on a map. Array of: {label, properties} where properties is an array of [key, value]
export const mapInfoAtom = atomWithStorage<MapInfo | null>('mapInfoAtom', null)
export const mapInfoPreferFormAtom = atomWithStorage(
  'mapInfoPreferForm', true, undefined, { getOnInit: true },
)
export const mapShowCenterAtom = atomWithStorage('mapShowCenterAtom', false)
export const personalMapCrsAtom = atomWithStorage<Record<string, string>>(
  'personalMapCrs',
  {},
)
export const personalClusteringAtom = atomWithStorage<Record<string, boolean>>(
  'personalLayerClustering',
  {},
)
// The order of layers in the map. An array of layer_presentation_ids
export const mapLayerSortingAtom = atomWithStorage<string[]>(
  'mapLayerSortingAtom',
  [],
  undefined,
  { getOnInit: true },
)
export const lastThemeBackgroundAtom = atomWithStorage<string | null>(
  'lastThemeBackground', null, undefined, { getOnInit: true },
)
export const mapDrawerVectorLayerDisplayAtom = atomWithStorage<string | null>(
  'mapDrawerVectorLayerDisplayAtom',
  null,
)

// The id of the place whose geometry is currently being edited
// Editing is a live interaction, not a display preference. Restoring its
// target on reload draws a separate overlay even if its data layer is off.
export const editingPlaceGeometryAtom = atom<string | null | false>(false)
// The id of the check whose geometry is currently being edited
export const editingCheckGeometryAtom = atom<string | null | false>(false)
// The id of the action whose geometry is currently being edited
export const editingActionGeometryAtom = atom<string | null | false>(false)
// True when any geometry is being edited on the map
export const drawingOnMapAtom = atom(
  (get) =>
    !!get(editingPlaceGeometryAtom) ||
    !!get(editingCheckGeometryAtom) ||
    !!get(editingActionGeometryAtom),
)
// True while the choosing tool is active: the next click on a geometry of an
// own layer (places/checks/actions) starts editing that geometry
export const choosingGeometryAtom = atomWithStorage<boolean>(
  'choosingGeometryAtom',
  false,
)
// The layers that are currently draggable. Any of: observations-to-assess, observations-not-to-assign, observations-assigned-1, observations-assigned-2
export const draggableLayersAtom = atomWithStorage<string[]>(
  'draggableLayersAtom',
  [],
)
// The layers that are currently droppable (any of: places_1, places_2). Array of layer names in the same format as draggableLayersAtom
export const droppableLayersAtom = atomWithStorage<string[]>(
  'droppableLayersAtom',
  [],
)
// Whether to show a dialog to confirm assigning an observation to a single target. Preset: true
export const confirmAssigningToSingleTargetAtom = atomWithStorage(
  'confirmAssigningToSingleTargetAtom',
  true,
)
// If multiple places are close to the dropped location, the user can choose one of them. This state opens a dialog. Field contains: Object with: observation_id, latLng (where marker was dropped, used only for finding nearby places), places (array with: place_id, label, distance), current_place_id (the observation's current assignment, if any)
export const placesToAssignObservationToAtom =
  atomWithStorage<PlacesToAssignObservationTo | null>(
    'placesToAssignObservationToAtom',
    null,
  )
// When user has multiple accounts and creates a project, this atom holds the accounts to choose from
// and the callback to invoke once an account is selected. Uses plain atom (not atomWithStorage)
// because functions cannot be serialized.
export const chooseAccountForProjectAtom = atom<{
  accounts: { account_id: string; label: string | null }[]
  onAccountSelected: (account_id: string) => void
} | null>(null)
// Holds the data needed to show the "delete account" confirmation dialog.
// Uses a plain atom (not atomWithStorage) because it holds a callback.
export const confirmDeleteAccountAtom = atom<{
  accountId: string
  userId: string
  onConfirm: () => void
} | null>(null)
// The order of fields in the observation form. User can change it by drag and drop
// getOnInit reads localStorage synchronously so the first render already sees the
// persisted order — otherwise the append-missing-keys effect in ObservationData
// rewrites storage with the default order before the async hydration lands
export const observationFieldsSortedAtom = atomWithStorage<string[]>(
  'observationFieldsSortedAtom',
  [],
  undefined,
  { getOnInit: true },
)
// open tree nodes are node paths, e.g. [['projects', 'project-1'], ['projects', 'project-1', 'goals']]
// getOnInit reads localStorage synchronously so the very first render already
// sees the persisted nodes: jotai's useAtomValueRaw captures the initial value
// at first render and only subscribes in an effect, so the async hydration
// write from atomWithStorage's onMount is missed by components that subscribe
// after it (e.g. the tree, which mounts after Breadcrumbs in the same commit)
export const treeOpenNodesAtom = atomWithStorage<string[][]>(
  'treeOpenNodesAtom',
  [],
  undefined,
  { getOnInit: true },
)
// open nodes as a joined-path Set: the nav hooks check every node against
// every open node on every render (openNodes.some((array) =>
// isEqual(array, ownArray))) — with N visible rows and M open nodes that is
// N × M deep compares. The derived Set makes each check a hash lookup.
// Segments are url parts ('data', 'projects', uuids) and never contain '/'.
export const treeOpenNodesSetAtom = atom<ReadonlySet<string>>(
  (get) => new Set(get(treeOpenNodesAtom).map((node) => node.join('/'))),
)
// postgrestClient
export const postgrestClientAtom = atom<PostgrestClient | null>(null)

// an array of objects with keys:
// - id: set by addOperationAtom
// - time: set by addOperationAtom
// - table
// - rowIdName
// - rowId
// - operation (update, upsert, upsertMany, insert, insertMany, delete, deleteAll)
// - filter
// - draft: object with key-value pairs for the operation
// - prev: object with key-value pairs of previous value for reverting the operation
// localStorage writes for the operations queue are coalesced per
// microtask: bulk operations (imports) enqueue many operations in one tick,
// and the default storage re-serialized the whole queue to localStorage on
// every single enqueue (O(n²) bytes). Coalescing persists the final state
// once per burst, still before the browser can paint or yield.
// NB: without localStorage (node/tests) every operation is a no-op — the
// queue then behaves like jotai's default memory-only fallback
const coalescingLocalStorage = (() => {
  const hasLocalStorage = typeof localStorage !== 'undefined'
  const pending = new Map<string, string>()
  let scheduled = false
  const flush = () => {
    scheduled = false
    for (const [key, value] of pending) {
      try {
        localStorage.setItem(key, value)
      } catch (error) {
        console.error('Error persisting to localStorage:', error)
      }
    }
    pending.clear()
  }
  return {
    getItem: (key: string) =>
      hasLocalStorage ? localStorage.getItem(key) : null,
    setItem: (key: string, value: string) => {
      if (!hasLocalStorage) return
      pending.set(key, value)
      if (!scheduled) {
        scheduled = true
        queueMicrotask(flush)
      }
    },
    removeItem: (key: string) => {
      if (!hasLocalStorage) return
      pending.delete(key)
      localStorage.removeItem(key)
    },
  }
})()

export const operationsQueueAtom = atomWithStorage<QueuedOperation[]>(
  'operationsQueueAtom',
  [],
  createJSONStorage(() => coalescingLocalStorage),
  { getOnInit: true },
)

// Inline revert so store.ts doesn't need to import revertOperation.ts (which imports store.ts — circular)
async function revertOperationInPlace(db: PGlite, operation: QueuedOperation) {
  const { table, rowIdName, rowId, operation: op, draft, prev } = operation
  // draft is only an array for *Many operations, which never reach the revert
  // paths below; both branches work with the object shape
  const draftObj = draft as Record<string, unknown>
  const prevObj = prev as Record<string, unknown>
  if (op === 'delete') return
  if (op === 'insert') {
    // rowIdName/rowId may not be set on insert operations from createRows.ts;
    // infer the PK column from the table name following the codebase convention.
    const pkColumn = rowIdName ?? inferPkColumn(table, draftObj)
    const pkValue = rowId ?? (pkColumn ? draftObj?.[pkColumn] : undefined)
    if (!pkColumn || pkValue == null) {
      console.error(
        `revertOperationInPlace: cannot determine PK for insert revert on ${table}`,
      )
      return
    }
    try {
      await db.query(`DELETE FROM ${table} WHERE ${pkColumn} = $1`, [pkValue])
    } catch (e) {
      console.error(
        `revertOperationInPlace: error deleting row ${pkValue} from ${table}:`,
        e,
      )
    }
    return
  }
  try {
    let valuesSql = ''
    Object.keys(draftObj).forEach((key, index) => {
      valuesSql += `${key} = $${index + 1},`
    })
    const draftKeysLength = Object.keys(draftObj).length
    const isUsersTable = table === 'users'
    const args = [
      ...Object.keys(draftObj).map((key) => prevObj[key]),
      prevObj.updated_at,
      ...(isUsersTable ? [] : [prevObj.updated_by]),
      rowId,
    ]
    // prev can be partial (UI rows often select only some columns); null
    // must not overwrite the audit columns — coalesce keeps the stored value
    await db.query(
      `UPDATE ${table} SET ${valuesSql} updated_at = COALESCE($${draftKeysLength + 1}, updated_at)${isUsersTable ? '' : `, updated_by = COALESCE($${draftKeysLength + 2}, updated_by)`} WHERE ${rowIdName} = $${isUsersTable ? draftKeysLength + 2 : draftKeysLength + 3}`,
      args,
    )
  } catch (e) {
    console.error(
      `revertOperationInPlace: error reverting row ${rowId} in ${table}:`,
      e,
    )
  }
}
export const addOperationAtom = atom(
  (_get) => null,
  async (
    get,
    set,
    opDraft: Omit<QueuedOperation, 'id' | 'time'> & {
      // the caller verified the permission itself, before a local change
      // destroyed what the check reads (a project delete cascades its roles)
      skipPermissionCheck?: boolean
      separateEdit?: boolean
    },
  ) => {
    const db = get(pgliteDbAtom)
    const userId = get(userIdAtom)
    const { skipPermissionCheck, separateEdit, ...opFields } = opDraft

    const operation: QueuedOperation = {
      id: uuidv7(),
      time: new Date().toISOString(),
      ...opFields,
    }

    if (db && userId && !skipPermissionCheck) {
      const row = { ...opDraft.prev, ...opDraft.draft }
      const { allowed, userRole } = await checkWritePermission(
        db,
        userId,
        opDraft.table,
        row,
        opDraft.operation,
      )
      if (!allowed) {
        await revertOperationInPlace(db, operation)
        const body =
          userRole ?
            `Your role '${userRole}' does not allow write operations. Writer or higher is required.`
          : 'You do not have write access to this data.'
        set(addNotificationAtom, {
          title: 'Insufficient permissions',
          body,
          intent: 'error',
          duration: 10000,
        })
        if (separateEdit) throw new Error(body)
        return
      }
    }

    // console.log('store.addOperationAtom, operation:', operation)
    if (!separateEdit && isAggregatableUpdate(opFields)) {
      // aggregate field edits into one operation per row and form session,
      // flushed when the session ends (form blur, navigation, tab hide,
      // page close, ~5s of inactivity) — see modules/operationAggregation.ts
      registerAggregatedUpdate(opFields)
      return
    }
    // any other write: flush buffered edits first so the queue keeps write
    // order (e.g. an update ahead of its row's delete)
    flushAggregatedUpdates()
    const opQueue = get(operationsQueueAtom)
    set(operationsQueueAtom, [operation, ...opQueue])
  },
)
// wires the update aggregation: field-edit updates are buffered (one merged
// operation per row and form session) and flushed onto the queue when the
// session ends. Runs at module load so the boot heal enqueues the edits of a
// crashed session before the sync starts pulling server state.
// The queue is newest-first; flushed entries arrive in first-edit order
// (oldest first), so reversed they keep that contract.
initOperationAggregation({
  enqueue: (ops) => {
    const opQueue = store.get(operationsQueueAtom)
    store.set(operationsQueueAtom, [...ops.slice().reverse(), ...opQueue])
  },
})
export const removeOperationAtom = atom(
  (_get) => null,
  (get, set, id: string) => {
    const opQueue = get(operationsQueueAtom)
    set(
      operationsQueueAtom,
      opQueue.filter((op) => op.id !== id),
    )
  },
)

export const onlineAtom = atom(true)
export const shortTermOnlineAtom = atom(true)

// offline files (src/modules/offlineFiles.ts + OfflineFilesManager): status
// per file that is EFFECTIVELY offline (project gate on, and marked via
// files.offline or a place_levels *_files_offline flag) — absence from the
// record means not offline. Filled by the manager; read by the file form
// header toggle, the files list indicator and the status view.
export type OfflineFileStatus =
  | 'queued'
  | 'downloading'
  | 'cached'
  | 'error'
  | 'too-large'
  | 'no-url'
export const offlineFilesStatusAtom = atom<Record<string, OfflineFileStatus>>({})
export const offlineStorageAtom = atom<{
  usage: number
  quota: number
} | null>(null)

// bumped periodically so the operations observer re-runs:
// a reconnect can happen while a failed operation is still retrying,
// and that missed atom change would otherwise leave the queue stalled
export const operationsRetryTickAtom = atom(0)

export const pgliteDbAtom = atom<PGlite | null>(null)

// an array of objects with keys:
// - id
// - time
// - title
// - message
// - info
// - type ('success', 'warning', 'info', 'error')
// - duration
// - dismissible?
// - allDismissible?
// - actionLabel?
// - actionName?
// - actionArgument?
export const notificationsAtom = atom<AppNotification[]>([])
export const updateNotificationAtom = atom(
  (_get) => null,
  (
    get,
    set,
    { id, draft }: { id: string; draft: Partial<AppNotification> },
  ) => {
    const notifications = get(notificationsAtom)
    const notification = notifications.splice(
      notifications.findIndex((n) => n.id === id),
      1,
    )[0]
    if (!notification) return
    const updatedNotification = {
      ...notification,
      ...draft,
    }
    set(notificationsAtom, [updatedNotification, ...notifications])
  },
)
export const removeNotificationAtom = atom(
  (_get) => null,
  (get, set, id: string) => {
    const notifications = get(notificationsAtom)
    set(
      notificationsAtom,
      notifications.filter((n) => n.id !== id),
    )
  },
)
export const addNotificationAtom = atom(
  (_get) => null,
  (
    get,
    set,
    draft: Partial<Omit<AppNotification, 'id' | 'time'>> & { id?: string },
  ) => {
    const notifications = get(notificationsAtom)
    // do not stack same messages
    const notificationsWithSameMessage = notifications.filter(
      (n) => n.body !== undefined && n.body === draft.body,
    )
    if (notificationsWithSameMessage.length > 0) {
      return console.log(
        'Notification with same body already exists, not adding another.',
      )
    }

    const id = draft.id ?? uuidv7()
    const notification: AppNotification = {
      // set default values
      id,
      time: Date.now(),
      duration: 10000, // standard value: 10000
      intent: 'info', // 'success' | 'error' | 'warning' | 'info'
      dismissable: true,
      allDismissable: true,
      title: undefined,
      body: undefined,
      // paused: If true, the notification is not dismissed according to timeout. Instead, it is dismissed when pause is updated to false. A spinner is shown.
      paused: undefined,
      // Progress of a long running task in %. Only passed, if progress can be measured. A progress bar is shown.
      progress: undefined,
      // overwrite with passed in ones:
      ...draft,
    }
    set(notificationsAtom, [notification, ...notifications])
    // remove after duration
    setTimeout(() => set(removeNotificationAtom, id), notification.duration)

    return notification.id
  },
)
