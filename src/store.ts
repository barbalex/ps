import { createStore, atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { constants } from './modules/constants.ts'
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
export const syncingAtom = atomWithStorage('syncingAtom', false)
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

export const projectsNavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'projectsNavListFilterIsVisibleAtom',
  false,
)
export const fieldsNavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'fieldsNavListFilterIsVisibleAtom',
  false,
)
export const fieldTypesNavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'fieldTypesNavListFilterIsVisibleAtom',
  false,
)
export const widgetTypesNavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'widgetTypesNavListFilterIsVisibleAtom',
  false,
)
export const widgetsForFieldsNavListFilterIsVisibleAtom =
  atomWithToggleAndStorage('widgetsForFieldsNavListFilterIsVisibleAtom', false)
export const projectReportsNavListFilterIsVisibleAtom =
  atomWithToggleAndStorage('projectReportsNavListFilterIsVisibleAtom', false)
export const personsNavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'personsNavListFilterIsVisibleAtom',
  false,
)
export const wmsLayersNavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'wmsLayersNavListFilterIsVisibleAtom',
  false,
)
export const vectorLayersNavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'vectorLayersNavListFilterIsVisibleAtom',
  false,
)
export const listsNavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'listsNavListFilterIsVisibleAtom',
  false,
)
export const unitsNavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'unitsNavListFilterIsVisibleAtom',
  false,
)
export const subprojectsNavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'subprojectsNavListFilterIsVisibleAtom',
  false,
)
export const subprojectReportsNavListFilterIsVisibleAtom =
  atomWithToggleAndStorage('subprojectReportsNavListFilterIsVisibleAtom', false)
export const goalsNavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'goalsNavListFilterIsVisibleAtom',
  false,
)
export const places1NavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'places1NavListFilterIsVisibleAtom',
  false,
)
export const places2NavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'places2NavListFilterIsVisibleAtom',
  false,
)
export const checks1NavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'checks1NavListFilterIsVisibleAtom',
  false,
)
export const checks2NavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'checks2NavListFilterIsVisibleAtom',
  false,
)
export const actions1NavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'actions1NavListFilterIsVisibleAtom',
  false,
)
export const actions2NavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'actions2NavListFilterIsVisibleAtom',
  false,
)
export const placeReports1NavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'placeReports1NavListFilterIsVisibleAtom',
  false,
)
export const placeReports2NavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'placeReports2NavListFilterIsVisibleAtom',
  false,
)
export const filesNavListFilterIsVisibleAtom = atomWithToggleAndStorage(
  'filesNavListFilterIsVisibleAtom',
  false,
)
export const navListFilterIsVisibleAtoms = {
  projects: projectsNavListFilterIsVisibleAtom,
  fields: fieldsNavListFilterIsVisibleAtom,
  fieldTypes: fieldTypesNavListFilterIsVisibleAtom,
  widgetTypes: widgetTypesNavListFilterIsVisibleAtom,
  widgetsForFields: widgetsForFieldsNavListFilterIsVisibleAtom,
  projectReports: projectReportsNavListFilterIsVisibleAtom,
  persons: personsNavListFilterIsVisibleAtom,
  wmsLayers: wmsLayersNavListFilterIsVisibleAtom,
  vectorLayers: vectorLayersNavListFilterIsVisibleAtom,
  lists: listsNavListFilterIsVisibleAtom,
  units: unitsNavListFilterIsVisibleAtom,
  subprojects: subprojectsNavListFilterIsVisibleAtom,
  subprojectReports: subprojectReportsNavListFilterIsVisibleAtom,
  goals: goalsNavListFilterIsVisibleAtom,
  places1: places1NavListFilterIsVisibleAtom,
  places2: places2NavListFilterIsVisibleAtom,
  checks1: checks1NavListFilterIsVisibleAtom,
  checks2: checks2NavListFilterIsVisibleAtom,
  actions1: actions1NavListFilterIsVisibleAtom,
  actions2: actions2NavListFilterIsVisibleAtom,
  placeReports1: placeReports1NavListFilterIsVisibleAtom,
  placeReports2: placeReports2NavListFilterIsVisibleAtom,
  files: filesNavListFilterIsVisibleAtom,
}
