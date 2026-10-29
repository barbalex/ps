import { atom } from 'jotai'
import { isEqual } from 'es-toolkit'

import type { TreeRegisteredRow } from './types.ts'

/**
 * registry of the virtualized tree: rows keyed by JSON.stringify(ownArray).
 * Rows are registered by Registrar components that run the navData hooks.
 * Registrations survive a row leaving the virtualized window - the walker
 * keeps using them until the row re-enters the window and re-registers.
 */
export const treeRegisteredRowsAtom = atom<Map<string, TreeRegisteredRow>>(
  new Map(),
)

export const setTreeRegisteredRowAtom = atom(
  () => null,
  (
    _get,
    set,
    { key, row }: { key: string; row: TreeRegisteredRow },
  ) => {
    set(treeRegisteredRowsAtom, (prev) => {
      if (isEqual(prev.get(key), row)) return prev
      const next = new Map(prev)
      next.set(key, row)
      return next
    })
  },
)

// the root rows (Projects, Users, Messages...), keyed by a stable slot name.
// Map order = display order
export const treeRootRowsAtom = atom<Map<string, TreeRegisteredRow>>(
  new Map(),
)

export const setTreeRootRowsAtom = atom(
  () => null,
  (
    _get,
    set,
    { orderKey, row }: { orderKey: string; row: TreeRegisteredRow },
  ) => {
    set(treeRootRowsAtom, (prev) => {
      if (isEqual(prev.get(orderKey), row)) return prev
      const next = new Map(prev)
      next.set(orderKey, row)
      return next
    })
  },
)
