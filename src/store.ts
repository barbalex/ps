// import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const userIdAtom = atomWithStorage('userIdAtom', null) // TODO: update usage

export const userEmailAtom = atomWithStorage('userEmailAtom', null) // TODO: update usage

export const mapMaximizedAtom = atomWithStorage('mapMaximizedAtom', false)

export const designingAtom = atomWithStorage('designingAtom', false)

export const navsOverflowingAtom = atomWithStorage('navsOverflowingAtom', false) // TODO: update usage

export const breadcrumbsOverflowingAtom = atomWithStorage(
  // TODO: update usage
  'breadcrumbsOverflowingAtom',
  false,
)

export const tabsAtom = atomWithStorage('tabsAtom', ['tree', 'data']) // TODO: update usage

export const syncingAtom = atomWithStorage('syncingAtom', false) // TODO: update usage
