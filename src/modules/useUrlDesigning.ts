import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { useEffect } from 'react'

import { designingAtom } from '../store.ts'

// Design mode is linkable via ?designing=1. The url wins when present; the
// per-project designingAtom map (localStorage) remains as the persisted
// fallback. The param is retained across navigation (see
// urlSearchKeys.ts), so design mode is active for the whole session until
// turned off — the atom map keeps it per project for future visits.

const urlDesigningValue = (raw: unknown): boolean | undefined =>
  raw === true || raw === 1 || raw === '1' || raw === 'true' ?
    true
  : raw === false || raw === 0 || raw === '0' || raw === 'false' ?
    false
  : undefined

export const useUrlDesigning = (projectId: string | undefined) => {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const [designingMap, setDesigningMap] = useAtom(designingAtom)

  const fromUrl = urlDesigningValue(search.designing)
  const designing = fromUrl ?? designingMap[projectId ?? ''] ?? false

  // mirror an explicit url value into the atom map so the many atom
  // readers (form design editors, nav data, map layers) see it too
  useEffect(() => {
    if (fromUrl === undefined || !projectId) return
    if ((designingMap[projectId] ?? false) !== fromUrl) {
      setDesigningMap((prev) => ({ ...prev, [projectId]: fromUrl }))
    }
  }, [fromUrl, projectId, designingMap, setDesigningMap])

  const setDesigning = (next: boolean) => {
    if (projectId) setDesigningMap((prev) => ({ ...prev, [projectId]: next }))
    navigate(
      {
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          designing: next ? 1 : undefined,
        }),
        replace: true,
      } as unknown as Parameters<typeof navigate>[0],
    )
  }

  return [designing, setDesigning] as const
}
