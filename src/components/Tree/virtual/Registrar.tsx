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
  const config = treeConfigs[type]

  // unknown types appear while the configs are being built up -
  // deterministic per type, so the conditional return is safe
  if (!config) return null

  const navData = config.hook(params, nav)

  const key = JSON.stringify(navData.ownArray.map((s) => s ?? ''))
  const row: TreeRegisteredRow = {
    key,
    ownArray: navData.ownArray.map((s) => s ?? ''),
    isRoot: config.isRoot,
    label: navData.label,
    level,
    to: navData.ownUrl,
    childrenCount: navData.navs?.length ?? 0,
    siblingType: navData.siblingType,
    children: config.children?.({ params, nav, navData, level }),
  }

  const setRow = useSetAtom(setTreeRegisteredRowAtom)
  const setRootRow = useSetAtom(setTreeRootRowsAtom)
  const prevRow = useRef<TreeRegisteredRow | null>(null)

  useEffect(() => {
    if (isEqual(prevRow.current, row)) return
    prevRow.current = row
    if (config.isRoot) {
      setRootRow({ orderKey: type, row })
    } else {
      setRow({ key, row })
    }
  })

  return null
}
