// import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const userIdAtom = atomWithStorage('userIdAtom', null)

export const userEmailAtom = atomWithStorage('userEmailAtom', null)

export const mapMaximizedAtom = atomWithStorage('mapMaximizedAtom', false)

export const designingAtom = atomWithStorage('designingAtom', false)

export const navsOverflowingAtom = atomWithStorage('navsOverflowingAtom', false)

export const breadcrumbsOverflowingAtom = atomWithStorage(
  'breadcrumbsOverflowingAtom',
  false,
)

export const tabsAtom = atomWithStorage('tabsAtom', ['tree', 'data'])
