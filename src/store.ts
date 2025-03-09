import { createStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
// import { atom } from 'jotai'

export const store = createStore()

// TODO: check what this is good / used for. Seems no use now
export const userIdAtom = atomWithStorage('userIdAtom', null)
export const userEmailAtom = atomWithStorage('userEmailAtom', null)
export const designingAtom = atomWithStorage('designingAtom', false)
export const navsOverflowingAtom = atomWithStorage('navsOverflowingAtom', true)
export const breadcrumbsOverflowingAtom = atomWithStorage(
  'breadcrumbsOverflowingAtom',
  true,
)
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
  '',
)
export const subprojectReportsFilterAtom = atomWithStorage(
  'subprojectReportsFilterAtom',
  '',
)
export const goalsFilterAtom = atomWithStorage('goalsFilterAtom', '')
export const places1FilterAtom = atomWithStorage('places1FilterAtom', [])
export const places2FilterAtom = atomWithStorage('places2FilterAtom', [])
export const checks1FilterAtom = atomWithStorage('checks1FilterAtom', [])
export const checks2FilterAtom = atomWithStorage('checks2FilterAtom', [])
export const actions1FilterAtom = atomWithStorage('actions1FilterAtom', [])
export const actions2FilterAtom = atomWithStorage('actions2FilterAtom', [])
export const placeReports1FilterAtom = atomWithStorage(
  'placeReports1FilterAtom',
  '',
)
export const placeReports2FilterAtom = atomWithStorage(
  'placeReports2FilterAtom',
  '',
)
export const filesFilterAtom = atomWithStorage('filesFilterAtom', '')
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
