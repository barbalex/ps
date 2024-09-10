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
