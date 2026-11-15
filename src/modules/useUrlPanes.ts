import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { useMemo } from 'react'

import { tabsAtom } from '../store.ts'

// The visible layout panes (tree / data / map) are linkable via
// ?panes=tree,data — url params win when present, the tabsAtom
// (localStorage) remains as the persisted fallback. Toggling panes writes
// both; the default layout produces no param.

const VALID_PANES = ['tree', 'data', 'map'] as const
type Pane = (typeof VALID_PANES)[number]
const DEFAULT_PANES: Pane[] = ['tree', 'data']

const parsePanes = (value: unknown): Pane[] | null => {
  if (typeof value !== 'string') return null
  const panes = value
    .split(',')
    .map((pane) => pane.trim())
    .filter((pane): pane is Pane =>
      (VALID_PANES as readonly string[]).includes(pane),
    )
  // dedupe, keeping first occurrence order
  const unique = [...new Set(panes)]
  return unique.length > 0 ? unique : null
}

export const useUrlPanes = () => {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const [tabs, setTabs] = useAtom(tabsAtom)

  // memoized so callers re-render only when the param value actually
  // changes (the parsed array identity would otherwise be new each render)
  const urlPanes = useMemo(() => parsePanes(search.panes), [search.panes])
  const panes = urlPanes ?? (tabs as Pane[])

  const setPanes = (nextPanes: string[]) => {
    setTabs(nextPanes)
    const isDefault =
      nextPanes.length === DEFAULT_PANES.length &&
      nextPanes.every((pane, i) => pane === DEFAULT_PANES[i])
    navigate(
      {
        // undefined (or the default layout) removes the param
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          panes: isDefault ? undefined : nextPanes.join(','),
        }),
        replace: true,
      } as unknown as Parameters<typeof navigate>[0],
    )
  }

  return [panes, setPanes] as const
}
