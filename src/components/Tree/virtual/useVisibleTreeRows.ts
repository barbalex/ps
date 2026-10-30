import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { isEqual } from 'es-toolkit'

import { treeOpenNodesAtom } from '../../../store.ts'
import { treeRegisteredRowsAtom, treeRootRowsAtom } from './atoms.ts'
import type { TreeRegisteredRow } from './types.ts'

export interface TreeRow {
  key: string
  row: TreeRegisteredRow
  isOpen: boolean
}

const isRowOpen = (ownArray: string[], openNodes: string[][]): boolean =>
  openNodes.some((array) => isEqual(array, ownArray))

/**
 * Flattens the visible tree into a row array for the virtualizer:
 * root rows in registration order, then children of open rows.
 * A child row is looked up by JSON([...parent.ownArray, nav.id]) - the same
 * url segment the child Registrar's ownArray is built from.
 */
export const useVisibleTreeRows = () => {
  const rootRows = useAtomValue(treeRootRowsAtom)
  const registeredRows = useAtomValue(treeRegisteredRowsAtom)
  const openNodes = useAtomValue(treeOpenNodesAtom)

  const rows = useMemo(() => {
    const rows: TreeRow[] = []
    const visited = new Set<string>()

    const visit = (row: TreeRegisteredRow) => {
      // guard against (stale) registration cycles
      if (visited.has(row.key)) return
      visited.add(row.key)
      const isOpen = isRowOpen(row.ownArray, openNodes)
      rows.push({ key: row.key, row, isOpen })
      if (!isOpen) return
      for (const child of row.children ?? []) {
        const nav = (child.nav ?? {}) as { id?: string }
        if (!nav.id) continue
        // nav ids can be multi-segment ('filtered-checks/<id>/checks')
        const childKey = JSON.stringify([
          ...row.ownArray,
          ...String(nav.id).split('/').filter(Boolean),
        ])
        const childRow = registeredRows.get(childKey)
        if (childRow) visit(childRow)
      }
    }

    for (const rootRow of rootRows.values()) visit(rootRow)

    return rows
  }, [rootRows, registeredRows, openNodes])

  return rows
}
