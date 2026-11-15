import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { useMemo } from 'react'

import { mapCenterAtom, mapZoomAtom } from '../store.ts'

// The map viewport is linkable via `?c=lat,lng&z=zoom`. The url wins when
// present; the localStorage atoms remain as the persisted fallback for
// visits without params (and keep the last view warm). Panning the map
// updates both, on moveend only — see BoundsListener.

const CENTER_PRECISION = 5 // ~1 m, keeps urls short

const parseCenter = (value: unknown): [number, number] | null => {
  if (typeof value !== 'string') return null
  const [lat, lng] = value.split(',').map(Number)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return [lat, lng]
}

const parseZoom = (value: unknown): number | null => {
  // parseSearch JSON-parses numeric strings, so zoom may arrive as number
  // or string depending on how the url was written
  const zoom = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(zoom)) return null
  return Math.min(Math.max(zoom, 0), 22)
}

const formatCenter = (center: [number, number]) =>
  `${center[0].toFixed(CENTER_PRECISION)},${center[1].toFixed(CENTER_PRECISION)}`

export const useUrlMapViewport = () => {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const [storedCenter, setStoredCenter] = useAtom(mapCenterAtom)
  const [storedZoom, setStoredZoom] = useAtom(mapZoomAtom)

  // memoized so the parsed arrays keep their identity between renders:
  // the map restore effect in BoundsListener depends on them and would
  // re-run on every render otherwise
  const urlCenter = useMemo(
    () => parseCenter(search.c),
    [search.c],
  )
  const urlZoom = useMemo(() => parseZoom(search.z), [search.z])
  const center = useMemo(
    () => (urlCenter ?? storedCenter) as [number, number],
    [urlCenter, storedCenter],
  )
  const zoom = useMemo(
    () => urlZoom ?? storedZoom,
    [urlZoom, storedZoom],
  )

  const saveViewport = (center: [number, number], zoom: number) => {
    setStoredCenter(center)
    setStoredZoom(zoom)
    navigate(
      {
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          c: formatCenter(center),
          // numbers stringify bare (z=13); strings would get JSON-quoted
          z: zoom,
        }),
        replace: true,
      } as unknown as Parameters<typeof navigate>[0],
    )
  }

  return {
    urlCenter,
    urlZoom,
    center,
    zoom,
    saveViewport,
  }
}
