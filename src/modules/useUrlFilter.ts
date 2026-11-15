import { useNavigate, useSearch } from '@tanstack/react-router'

import type { TableRowFilter } from '../store.ts'

// List filters live in `f-<key>` search params (e.g. `?f-checks1=[…]`) so
// every filtered view is a shareable link. The /data route retains all
// `f-*` params across navigations (see src/routes/data/route.tsx), which
// keeps filters applying while the user browses around — matching the
// previous localStorage-backed behaviour.

export const filterUrlKeyPrefix = 'f-'

export const filterUrlKey = (key: string) => `${filterUrlKeyPrefix}${key}`

// values arrive from the URL, so they are user-editable: keep only what
// looks like a valid or-filter array
const coerceFilter = (value: unknown): TableRowFilter[] =>
  Array.isArray(value) ?
    value.filter(
      (orFilter): orFilter is TableRowFilter =>
        !!orFilter && typeof orFilter === 'object' && !Array.isArray(orFilter),
    )
  : []

export const useUrlFilter = (key: string) => {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const urlKey = filterUrlKey(key)
  const filter = coerceFilter(search[urlKey])

  const setFilter = (nextFilter: TableRowFilter[]) => {
    // navigate() resolves its search updater type against the root route's
    // schema; the loose Record type is correct at runtime, so bridge it
    navigate(
      {
        // undefined removes the param from the URL
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          [urlKey]: nextFilter.length ? nextFilter : undefined,
        }),
        // filter edits are intermediate states of one view: replace instead
        // of pushing a history entry per keystroke
        replace: true,
      } as unknown as Parameters<typeof navigate>[0],
    )
  }

  return [filter, setFilter] as const
}
