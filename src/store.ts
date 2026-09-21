import { createStore, atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { IntlShape } from 'react-intl'
import type { PGlite } from '@electric-sql/pglite'
import type { PostgrestClient } from '@supabase/postgrest-js'
import type { LatLngBoundsExpression } from 'leaflet'
import { constants } from './modules/constants.ts'
import { v7 as uuidv7 } from 'uuid'
import { checkWritePermission } from './modules/checkWritePermission.ts'
import { inferPkColumn } from './modules/inferPkColumn.ts'
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
  featureLabel?: string
  properties: [string, unknown][]
  ownTable?: 'place' | 'check' | 'action'
  ownId?: string
  ownPlaceId?: string
  ownSubprojectId?: string
  ownParentId?: string
}

export interface MapInfo {
  lat: number
  lng: number
  zoom: number
  layers: MapInfoLayer[]
}

export interface PlaceToAssign {
  place_id: string
  label: string | null
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
export const isDesktopViewAtom = atomWithStorage('isDesktopView', false)
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
export const tabsAtom = atomWithStorage('tabsAtom', ['tree', 'data'])
export type TableRowFilter = Record<string, unknown>
export const qcsRunOnlyWithResultsAtom = atomWithStorage(
  'qcsRunOnlyWithResults',
  false,
)
export const qcsRunLabelFilterAtom = atomWithStorage('qcsRunLabelFilter', '')
export const qcsRunFilteredCountAtom = atom<number | null>(null)

export const rootQcsRunOnlyWithResultsAtom = atomWithStorage(
  'rootQcsRunOnlyWithResults',
  false,
)
export const rootQcsRunLabelFilterAtom = atomWithStorage(
  'rootQcsRunLabelFilter',
  '',
)
export const rootQcsRunFilteredCountAtom = atom<number | null>(null)

export const projectQcsRunOnlyWithResultsAtom = atomWithStorage(
  'projectQcsRunOnlyWithResults',
  false,
)
export const projectQcsRunLabelFilterAtom = atomWithStorage(
  'projectQcsRunLabelFilter',
  '',
)
export const projectQcsRunFilteredCountAtom = atom<number | null>(null)

export const rootExportsRunLabelFilterAtom = atomWithStorage(
  'rootExportsRunLabelFilter',
  '',
)
export const rootExportsRunFilteredCountAtom = atom<number | null>(null)

export const projectExportsRunLabelFilterAtom = atomWithStorage(
  'projectExportsRunLabelFilter',
  '',
)
export const projectExportsRunFilteredCountAtom = atom<number | null>(null)

export const subprojectExportsRunLabelFilterAtom = atomWithStorage(
  'subprojectExportsRunLabelFilter',
  '',
)
export const subprojectExportsRunFilteredCountAtom = atom<number | null>(null)

const SUPPORTED_LANGUAGES = ['en', 'de', 'fr', 'it'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]
const _navLang = navigator.language.split('-')[0] as Language
const _defaultLanguage: Language = SUPPORTED_LANGUAGES.includes(_navLang)
  ? _navLang
  : 'de'
export const languageAtom = atomWithStorage<Language>(
  'language',
  _defaultLanguage,
  undefined,
  // getOnInit: read localStorage synchronously so the very first render
  // already uses the stored language instead of flashing the default
  { getOnInit: true },
)
export const intlAtom = atom<IntlShape | null>(null)

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

export const seenWmsServiceKeysAtom = atomWithStorage<string[]>(
  'seenWmsServiceKeysAtom',
  [],
)
export const seenWfsServiceKeysAtom = atomWithStorage<string[]>(
  'seenWfsServiceKeysAtom',
  [],
)

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
export const localMapValuesAtom = atomWithStorage<Record<string, boolean>>(
  'localMapValuesAtom',
  {},
)
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
export const mapShowCenterAtom = atomWithStorage('mapShowCenterAtom', false)
// The order of layers in the map. An array of layer_presentation_ids
export const mapLayerSortingAtom = atomWithStorage<string[]>(
  'mapLayerSortingAtom',
  [],
)
export const mapDrawerVectorLayerDisplayAtom = atomWithStorage<string | null>(
  'mapDrawerVectorLayerDisplayAtom',
  null,
)

// The id of the place whose geometry is currently being edited
export const editingPlaceGeometryAtom = atomWithStorage<
  string | null | false
>('editingPlaceGeometryAtom', false)
// The id of the check whose geometry is currently being edited
export const editingCheckGeometryAtom = atomWithStorage<
  string | null | false
>('editingCheckGeometryAtom', false)
// The id of the action whose geometry is currently being edited
export const editingActionGeometryAtom = atomWithStorage<
  string | null | false
>('editingActionGeometryAtom', false)
// True when any geometry is being edited on the map
export const drawingOnMapAtom = atom(
  (get) =>
    !!get(editingPlaceGeometryAtom) ||
    !!get(editingCheckGeometryAtom) ||
    !!get(editingActionGeometryAtom),
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
export const observationFieldsSortedAtom = atomWithStorage<string[]>(
  'observationFieldsSortedAtom',
  [],
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
// table filters
// Using array of or-filters
// Of objects with keys and value. why? because needs to be shown in the forms
// key is path i.e. jsonb is: data.key
export const projectsFilterAtom = atomWithStorage<Record<string, unknown>[]>(
  'projectsFilterAtom',
  [],
)
export const fieldsFilterAtom = atomWithStorage<TableRowFilter[]>('fieldsFilterAtom', [])
export const fieldTypesFilterAtom = atomWithStorage<TableRowFilter[]>('fieldTypesFilterAtom', [])
export const accountsFilterAtom = atomWithStorage<TableRowFilter[]>('accountsFilterAtom', [])
export const crsFilterAtom = atomWithStorage<TableRowFilter[]>('crsFilterAtom', [])
export const widgetTypesFilterAtom = atomWithStorage<TableRowFilter[]>(
  'widgetTypesFilterAtom',
  [],
)
export const widgetsForFieldsFilterAtom = atomWithStorage<TableRowFilter[]>(
  'widgetsForFieldsFilterAtom',
  [],
)
export const projectReportsFilterAtom = atomWithStorage<TableRowFilter[]>(
  'projectReportsFilterAtom',
  [],
)
export const projectUsersFilterAtom = atomWithStorage<TableRowFilter[]>(
  'projectUsersFilterAtom',
  [],
)
export const wmsLayersFilterAtom = atomWithStorage<TableRowFilter[]>('wmsLayersFilterAtom', [])
export const wmsServicesFilterAtom = atomWithStorage<TableRowFilter[]>(
  'wmsServicesFilterAtom',
  [],
)
export const wfsServicesFilterAtom = atomWithStorage<TableRowFilter[]>(
  'wfsServicesFilterAtom',
  [],
)
export const vectorLayersFilterAtom = atomWithStorage<TableRowFilter[]>(
  'vectorLayersFilterAtom',
  [],
)
export const listsFilterAtom = atomWithStorage<TableRowFilter[]>('listsFilterAtom', [])
export const taxonomiesFilterAtom = atomWithStorage<TableRowFilter[]>('taxonomiesFilterAtom', [])
export const unitsFilterAtom = atomWithStorage<TableRowFilter[]>('unitsFilterAtom', [])
export const subprojectsFilterAtom = atomWithStorage<TableRowFilter[]>(
  'subprojectsFilterAtom',
  [],
)
export const subprojectReportsFilterAtom = atomWithStorage<TableRowFilter[]>(
  'subprojectReportsFilterAtom',
  [],
)
export const subprojectUsersFilterAtom = atomWithStorage<TableRowFilter[]>(
  'subprojectUsersFilterAtom',
  [],
)
export const subprojectTaxaFilterAtom = atomWithStorage<TableRowFilter[]>(
  'subprojectTaxaFilterAtom',
  [],
)
export const chartsFilterAtom = atomWithStorage<TableRowFilter[]>('chartsFilterAtom', [])
export const observationImportsFilterAtom = atomWithStorage<TableRowFilter[]>(
  'observationImportsFilterAtom',
  [],
)
export const observationsToAssessFilterAtom = atomWithStorage<TableRowFilter[]>(
  'observationsToAssessFilterAtom',
  [],
)
export const observationsNotToAssignFilterAtom = atomWithStorage<TableRowFilter[]>(
  'observationsNotToAssignFilterAtom',
  [],
)
export const goalsFilterAtom = atomWithStorage<TableRowFilter[]>('goalsFilterAtom', [])
export const usersFilterAtom = atomWithStorage<TableRowFilter[]>('usersFilterAtom', [])
export const places1FilterAtom = atomWithStorage<TableRowFilter[]>('places1FilterAtom', [])
export const places2FilterAtom = atomWithStorage<TableRowFilter[]>('places2FilterAtom', [])
export const checks1FilterAtom = atomWithStorage<TableRowFilter[]>('checks1FilterAtom', [])
export const checks2FilterAtom = atomWithStorage<TableRowFilter[]>('checks2FilterAtom', [])
export const placeUsers1FilterAtom = atomWithStorage<TableRowFilter[]>(
  'placeUsers1FilterAtom',
  [],
)
export const placeUsers2FilterAtom = atomWithStorage<TableRowFilter[]>(
  'placeUsers2FilterAtom',
  [],
)
export const actions1FilterAtom = atomWithStorage<TableRowFilter[]>('actions1FilterAtom', [])
export const actions2FilterAtom = atomWithStorage<TableRowFilter[]>('actions2FilterAtom', [])
export const checkReports1FilterAtom = atomWithStorage<TableRowFilter[]>(
  'checkReports1FilterAtom',
  [],
)
export const checkReports2FilterAtom = atomWithStorage<TableRowFilter[]>(
  'checkReports2FilterAtom',
  [],
)
export const actionReports1FilterAtom = atomWithStorage<TableRowFilter[]>(
  'actionReports1FilterAtom',
  [],
)
export const actionReports2FilterAtom = atomWithStorage<TableRowFilter[]>(
  'actionReports2FilterAtom',
  [],
)
export const qcsFilterAtom = atomWithStorage<TableRowFilter[]>('qcsFilterAtom', [])
export const projectQcsFilterAtom = atomWithStorage<TableRowFilter[]>('projectQcsFilterAtom', [])
export const exportsFilterAtom = atomWithStorage<TableRowFilter[]>('exportsFilterAtom', [])
export const projectExportsFilterAtom = atomWithStorage<TableRowFilter[]>(
  'projectExportsFilterAtom',
  [],
)
// TODO: add
export const filesFilterAtom = atomWithStorage<TableRowFilter[]>('filesFilterAtom', [])
// TODO: add more filters
// filter_vector_layer_displays
// filter_subproject_chart_subjects
// filter_place_check_taxa_1
// filter_place_roles_1
// filter_place_charts_1
// filter_place_chart_subjects_1
// filter_check_quantities_1
// filter_check_quantities_2
// filter_place_check_taxa_2
// filter_place_roles_2
// filter_place_charts_2
// filter_place_chart_subjects_2

export const filterAtoms = {
  projects: projectsFilterAtom,
  fields: fieldsFilterAtom,
  fieldTypes: fieldTypesFilterAtom,
  accounts: accountsFilterAtom,
  crs: crsFilterAtom,
  widgetTypes: widgetTypesFilterAtom,
  widgetsForFields: widgetsForFieldsFilterAtom,
  projectReports: projectReportsFilterAtom,
  projectUsers: projectUsersFilterAtom,
  wmsLayers: wmsLayersFilterAtom,
  wmsServices: wmsServicesFilterAtom,
  wfsServices: wfsServicesFilterAtom,
  vectorLayers: vectorLayersFilterAtom,
  lists: listsFilterAtom,
  taxonomies: taxonomiesFilterAtom,
  units: unitsFilterAtom,
  subprojects: subprojectsFilterAtom,
  subprojectReports: subprojectReportsFilterAtom,
  subprojectUsers: subprojectUsersFilterAtom,
  subprojectTaxa: subprojectTaxaFilterAtom,
  charts: chartsFilterAtom,
  observationImports: observationImportsFilterAtom,
  observationsToAssess: observationsToAssessFilterAtom,
  observationsNotToAssign: observationsNotToAssignFilterAtom,
  goals: goalsFilterAtom,
  users: usersFilterAtom,
  places1: places1FilterAtom,
  places2: places2FilterAtom,
  checks1: checks1FilterAtom,
  checks2: checks2FilterAtom,
  placeUsers1: placeUsers1FilterAtom,
  placeUsers2: placeUsers2FilterAtom,
  actions1: actions1FilterAtom,
  actions2: actions2FilterAtom,
  checkReports1: checkReports1FilterAtom,
  checkReports2: checkReports2FilterAtom,
  actionReports1: actionReports1FilterAtom,
  actionReports2: actionReports2FilterAtom,
  files: filesFilterAtom,
  projectQcs: projectQcsFilterAtom,
  exports: exportsFilterAtom,
  projectExports: projectExportsFilterAtom,
}

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
export const operationsQueueAtom = atomWithStorage<QueuedOperation[]>(
  'operationsQueueAtom',
  [],
  undefined,
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
    await db.query(
      `UPDATE ${table} SET ${valuesSql} updated_at = $${draftKeysLength + 1}${isUsersTable ? '' : `, updated_by = $${draftKeysLength + 2}`} WHERE ${rowIdName} = $${isUsersTable ? draftKeysLength + 2 : draftKeysLength + 3}`,
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
    opDraft: Omit<QueuedOperation, 'id' | 'time'>,
  ) => {
    const db = get(pgliteDbAtom)
    const userId = get(userIdAtom)

    const operation: QueuedOperation = {
      id: uuidv7(),
      time: new Date().toISOString(),
      ...opDraft,
    }

    if (db && userId) {
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
        const body = userRole
          ? `Your role '${userRole}' does not allow write operations. Writer or higher is required.`
          : 'You do not have write access to this data.'
        set(addNotificationAtom, {
          title: 'Insufficient permissions',
          body,
          intent: 'error',
          duration: 10000,
        })
        return
      }
    }

    // console.log('store.addOperationAtom, operation:', operation)
    const opQueue = get(operationsQueueAtom)
    set(operationsQueueAtom, [operation, ...opQueue])
  },
)
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
  (get, set, { id, draft }: { id: string; draft: Partial<AppNotification> }) => {
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
