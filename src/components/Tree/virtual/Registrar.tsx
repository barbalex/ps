// dynamic hook calls (per-type navData hooks) are not compiler-analyzable
'use no memo'

import { useEffect, useRef } from 'react'
import { useSetAtom } from 'jotai'
import { isEqual } from 'es-toolkit'

import { setTreeRegisteredRowAtom, setTreeRootRowsAtom } from './atoms.ts'
import { treeConfigs } from './treeConfigs.tsx'
import type { TreeRegisteredRow } from './types.ts'

interface Props {
  type: string
  params: Record<string, unknown>
  nav?: Record<string, unknown>
  level: number
}

/**
 * Runs the node type's navData hook and registers the resulting row
 * (plus its children descriptors) in the tree registry. Renders nothing.
 * Mounts for rows inside the virtualized window and along the focus path.
 */
export const Registrar = ({ type, params, nav, level }: Props) => {
  const setRow = useSetAtom(setTreeRegisteredRowAtom)
  const setRootRow = useSetAtom(setTreeRootRowsAtom)
  const prevRow = useRef<TreeRegisteredRow | null>(null)

  // the type is fixed per instance (it is part of the element key), so the
  // dispatched navData hook is always the same hook for this component
  const config = treeConfigs[type]
  const navData = config ? config.hook(params, nav) : null

  const row: TreeRegisteredRow | null =
    config && navData ?
      {
        key: JSON.stringify(navData.ownArray.map((s) => s ?? '')),
        ownArray: navData.ownArray.map((s) => s ?? ''),
        isRoot: config.isRoot,
        label: navData.label,
        level,
        to: navData.ownUrl,
        childrenCount: navData.navs?.length ?? 0,
        siblingType: navData.siblingType,
        children: config.children?.({ params, nav, navData, level }),
        // kept on the registered row so the tree can keep this registrar
        // mounted while the row is open: the first registration happens
        // before the hook's live queries have resolved (label '...', no
        // children)
        descriptor:
          config.isRoot ? undefined : (
            { orderKey: String(nav?.id ?? type), type, params, nav, level }
          ),
      }
    : null

  useEffect(() => {
    if (!row || isEqual(prevRow.current, row)) return
    prevRow.current = row
    if (row.isRoot) {
      setRootRow({ orderKey: type, row })
    } else {
      setRow({ key: row.key, row })
    }
  })

  return null
}
