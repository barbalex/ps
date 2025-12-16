import { createStore, atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { constants } from './modules/constants.ts'
import { uuidv7 } from '@kripod/uuidv7'
// import { atom } from 'jotai'

export const store = createStore()

function atomWithToggleAndStorage(key, initialValue, storage) {
  const anAtom = atomWithStorage(key, initialValue, storage)
  const derivedAtom = atom(
    (get) => get(anAtom),
    (get, set, nextValue) => {
      const update = nextValue ?? !get(anAtom)
      set(anAtom, update)
    },
  )

  return derivedAtom
}

// nav stuff

export const enforceDesktopNavigationAtom = atomWithStorage(
  'enforceDesktopNavigation',
  false,
)
export const writeEnforceDesktopNavigationAtom = atom(
  (get) => get(enforceDesktopNavigationAtom),
  (get, set, enforce) => {
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
  (get, set, enforce) => {
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
  (get, set, width) => {
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

// TODO: check what this is good / used for. Seems no use now
export const userIdAtom = atomWithStorage('userIdAtom', null)
export const userEmailAtom = atomWithStorage('userEmailAtom', null)
export const designingAtom = atomWithStorage('designingAtom', false)
export const tabsAtom = atomWithStorage('tabsAtom', ['tree', 'data'])
// export const tabsAtom = atom(['tree', 'data'])
export const syncingAtom = atom(false)
export const mapMaximizedAtom = atomWithStorage('mapMaximizedAtom', false)
export const mapBoundsAtom = atomWithStorage('mapBoundsAtom', null)
// map of id (layer.id, key) and show boolean
export const showLocalMapAtom = atomWithStorage('showLocalMapAtom', false)
export const localMapValuesAtom = atomWithStorage('localMapValuesAtom', {})
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
export const mapInfoAtom = atomWithStorage('mapInfoAtom', null)
export const mapShowCenterAtom = atomWithStorage('mapShowCenterAtom', false)
// The order of layers in the map. An array of layer_presentation_ids
export const mapLayerSortingAtom = atomWithStorage('mapLayerSortingAtom', [])
export const mapDrawerVectorLayerDisplayAtom = atomWithStorage(
  'mapDrawerVectorLayerDisplayAtom',
  null,
)

// The id of the place whose geometry is currently being edited
export const editingPlaceGeometryAtom = atomWithStorage(
  'editingPlaceGeometryAtom',
  false,
)
// The id of the check whose geometry is currently being edited
export const editingCheckGeometryAtom = atomWithStorage(
  'editingCheckGeometryAtom',
  false,
)
// The id of the action whose geometry is currently being edited
export const editingActionGeometryAtom = atomWithStorage(
  'editingActionGeometryAtom',
  false,
)
// The layers that are currently draggable. Any of: occurrences-to-assess, occurrences-not-to-assign, occurrences-assigned-1, occurrences-assigned-2
export const draggableLayersAtom = atomWithStorage('draggableLayersAtom', [])
// The layer that is currently droppable (places1 or places2)
export const droppableLayerAtom = atomWithStorage('droppableLayerAtom', null)
// Whether to show a dialog to confirm assigning an occurrence to a single target. Preset: true
export const confirmAssigningToSingleTargetAtom = atomWithStorage(
  'confirmAssigningToSingleTargetAtom',
  true,
)
// If multiple places are close to the dropped location, the user can choose one of them. This state opens a dialog. Field contains: Object with: occurrence_id, places. Places is array with: place_id, label, distance
export const placesToAssignOccurrenceToAtom = atomWithStorage(
  'placesToAssignOccurrenceToAtom',
  null,
)
// The order of fields in the occurrence form. User can change it by drag and drop
export const occurrenceFieldsSortedAtom = atomWithStorage(
  'occurrenceFieldsSortedAtom',
  [],
)
export const treeOpenNodesAtom = atomWithStorage('treeOpenNodesAtom', [])
// table filters
// Using array of or-filters
// Of objects with keys and value. why? because needs to be shown in the forms
// key is path i.e. jsonb is: data.key
export const projectsFilterAtom = atomWithStorage<Record<string, unknown>[]>(
  'projectsFilterAtom',
  [],
)
export const fieldsFilterAtom = atomWithStorage('fieldsFilterAtom', [])
export const fieldTypesFilterAtom = atomWithStorage('fieldTypesFilterAtom', [])
export const widgetTypesFilterAtom = atomWithStorage(
  'widgetTypesFilterAtom',
  [],
)
export const widgetsForFieldsFilterAtom = atomWithStorage(
  'widgetsForFieldsFilterAtom',
  [],
)
export const projectReportsFilterAtom = atomWithStorage(
  'projectReportsFilterAtom',
  [],
)
export const personsFilterAtom = atomWithStorage('personsFilterAtom', [])
export const wmsLayersFilterAtom = atomWithStorage('wmsLayersFilterAtom', [])
export const vectorLayersFilterAtom = atomWithStorage(
  'vectorLayersFilterAtom',
  [],
)
export const listsFilterAtom = atomWithStorage('listsFilterAtom', [])
export const unitsFilterAtom = atomWithStorage('unitsFilterAtom', [])
export const subprojectsFilterAtom = atomWithStorage(
  'subprojectsFilterAtom',
  [],
)
export const subprojectReportsFilterAtom = atomWithStorage(
  'subprojectReportsFilterAtom',
  [],
)
export const goalsFilterAtom = atomWithStorage('goalsFilterAtom', [])
export const places1FilterAtom = atomWithStorage('places1FilterAtom', [])
export const places2FilterAtom = atomWithStorage('places2FilterAtom', [])
export const checks1FilterAtom = atomWithStorage('checks1FilterAtom', [])
export const checks2FilterAtom = atomWithStorage('checks2FilterAtom', [])
export const actions1FilterAtom = atomWithStorage('actions1FilterAtom', [])
export const actions2FilterAtom = atomWithStorage('actions2FilterAtom', [])
export const placeReports1FilterAtom = atomWithStorage(
  'placeReports1FilterAtom',
  [],
)
export const placeReports2FilterAtom = atomWithStorage(
  'placeReports2FilterAtom',
  [],
)
// TODO: add
export const filesFilterAtom = atomWithStorage('filesFilterAtom', [])
// TODO: add more filters
// filter_vector_layer_displays
// filter_taxonomies
// filter_occurrence_imports
// filter_subproject_charts
// filter_subproject_chart_subjects
// filter_place_check_taxa_1
// filter_place_users_1
// filter_place_charts_1
// filter_place_chart_subjects_1
// filter_check_values_1
// filter_check_values_2
// filter_place_check_taxa_2
// filter_place_users_2
// filter_place_charts_2
// filter_place_chart_subjects_2

export const filterAtoms = {
  projects: projectsFilterAtom,
  fields: fieldsFilterAtom,
  fieldTypes: fieldTypesFilterAtom,
  widgetTypes: widgetTypesFilterAtom,
  widgetsForFields: widgetsForFieldsFilterAtom,
  projectReports: projectReportsFilterAtom,
  persons: personsFilterAtom,
  wmsLayers: wmsLayersFilterAtom,
  vectorLayers: vectorLayersFilterAtom,
  lists: listsFilterAtom,
  units: unitsFilterAtom,
  subprojects: subprojectsFilterAtom,
  subprojectReports: subprojectReportsFilterAtom,
  goals: goalsFilterAtom,
  places1: places1FilterAtom,
  places2: places2FilterAtom,
  checks1: checks1FilterAtom,
  checks2: checks2FilterAtom,
  actions1: actions1FilterAtom,
  actions2: actions2FilterAtom,
  placeReports1: placeReports1FilterAtom,
  placeReports2: placeReports2FilterAtom,
  files: filesFilterAtom,
}

// postgrestClient
export const postgrestClientAtom = atom(null)
// an array of objects with keys: id, time, name(?), table, rowIdName, rowId, operation (update, insert, delete), variables, column, newValue, oldValue,
export const operationsQueueAtom = atomWithStorage('operationsQueueAtom', [])
export const addOperationAtom = atom(
  (get) => get(operationsQueueAtom),
  (get, set, opDraft) => {
    const opQueue = get(operationsQueueAtom)
    const operation = {
      id: uuidv7(),
      time: new Date().toISOString(),
      ...opDraft,
    }
    // console.log('store.addOperationAtom, operation:', operation)
    set(operationsQueueAtom, [operation, ...opQueue])
  },
)

export const onlineAtom = atom(true)
export const shortTermOnlineAtom = atom(true)

export const pgliteDbAtom = atom(null)

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
export const notificationsAtom = atomWithStorage('notificationsAtom', new Map())
export const updateNotificationAtom = atom(
  (get) => get(notificationsAtom),
  (get, set, { id, draft }) => {
    const notifications = get(notificationsAtom)
    const notification = notifications.get(id)
    if (!notification) return
    const updatedNotification = {
      ...notification,
      ...draft,
    }
    notifications.set(id, updatedNotification)
    set(notificationsAtom, notifications)
  },
)
export const removeNotificationAtom = atom(
  (get) => get(notificationsAtom),
  (get, set, id) => {
    // TODO:
    const notifications = get(notificationsAtom)
    notifications.delete(id)
    set(notificationsAtom, notifications)
  },
)
export const addNotificationAtom = atom(
  (get) => get(notificationsAtom),
  (get, set, draft) => {
    const notifications = get(notificationsAtom)
    const removeNotificationById = get(removeNotificationAtom)
    // do not stack same messages
    const notificationsWithSameMessage = Array.from(
      notifications.values(),
    ).filter((n) => n.message === draft.message)
    if (notificationsWithSameMessage.length > 0) return

    const notification = {
      // set default values
      id: uuidv7(),
      time: Date.now(),
      duration: 10000, // standard value: 10000
      intent: 'info', // 'success' | 'error' | 'warning' | 'info'
      dismissable: true,
      allDismissable: true,
      title: undefined,
      body: undefined,
      // paused: If true, the notification is not dismissed according to timeout. Instead, it is dismissed when pause is updated to false. A spinner is shown.
      paused: false,
      // Progress of a long running task in %. Only passed, if progress can be measured. A progress bar is shown.
      progress: undefined,
      // overwrite with passed in ones:
      ...draft,
    }
    notifications.set(notification.id, notification)
    set(notificationsAtom, notifications)
    // remove after duration
    setTimeout(() => {
      set(removeNotificationAtom, removeNotificationById(notification.id))
    }, notification.duration)
    return notification.id
  },
)

// begins true, is set to false after initialization (or it's not needed)
export const sqlInitializingAtom = atom(true)
