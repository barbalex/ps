// import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const userIdAtom = atomWithStorage('userIdAtom', null)

export const userEmailAtom = atomWithStorage('userEmailAtom', null)

export const designingAtom = atomWithStorage('designingAtom', false)

export const navsOverflowingAtom = atomWithStorage('navsOverflowingAtom', false)

export const breadcrumbsOverflowingAtom = atomWithStorage(
  'breadcrumbsOverflowingAtom',
  false,
)

export const tabsAtom = atomWithStorage('tabsAtom', ['tree', 'data'])

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
// With this structure, wms and wfs can set their layer data into such an object, then add the object to the existing in app_states.map_info
// app_states.map_info is reset when user closes info window, so memory is not wasted
// the info drawer filters all the objects with correct lat, lng and zoom and shows them
// Information presented, when user clicks on a map. Array of: {label, properties} where properties is an array of [key, value]
export const mapInfoAtom = atomWithStorage('mapInfoAtom', null)

export const mapShowCenterAtom = atomWithStorage('mapShowCenterAtom', false)

// The order of layers in the map. An array of layer_presentation_ids
export const mapLayerSortingAtom = atomWithStorage('mapLayerSortingAtom', [])
