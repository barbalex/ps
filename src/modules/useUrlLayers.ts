import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { mapLayerSortingAtom } from '../store.ts'

// Which layers the map shows is linkable via ?layers=<id>,<id>: the param
// is the map's render list (layer_presentation ids in draw order, plus the
// OSM pseudo id for the base layer). When present it replaces the default
// view — the layer_presentations.active design flags plus the
// mapLayerSorting atom — so a link reproduces the exact layer stack.
// Toggling layer visibility writes this param (the first toggle
// materializes the current view); the db flags remain the default and are
// never touched by it, so view changes need no write permission.

export const OSM_LAYER_PRESENTATION_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

const parseLayers = (value: unknown): string[] | null => {
  if (typeof value !== 'string') return null
  const ids = value
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
  return ids
}

export const useUrlLayers = () => {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const mapLayerSorting = useAtomValue(mapLayerSortingAtom)

  // memoized on the raw param so the array identity only changes when the
  // param does — Layers uses it as a render list and redraw key
  const urlLayers = useMemo(() => parseLayers(search.layers), [search.layers])

  // the effective render list: url wins, the sorting atom is the fallback
  const layers = urlLayers ?? mapLayerSorting
  const isOverridden = urlLayers !== null

  const setLayers = (nextLayers: string[]) => {
    navigate(
      {
        // An explicitly empty list hides every layer; removing the parameter
        // altogether restores the project's defaults.
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          layers: nextLayers.join(','),
        }),
        replace: true,
      } as unknown as Parameters<typeof navigate>[0],
    )
  }

  // add/remove one layer; with no override yet the current render list is
  // materialized into the param first, so the other layers keep their
  // visibility
  const setLayerVisible = (layerPresentationId: string, visible: boolean) => {
    const base = layers
    const nextLayers =
      visible ?
        base.includes(layerPresentationId) ? base
        : [...base, layerPresentationId]
      : base.filter((id) => id !== layerPresentationId)
    setLayers(nextLayers)
  }

  // view-time visibility of a layer presentation: the override list wins
  // over the layer_presentations.active design flag
  const isLayerVisible = (layerPresentationId: string, dbActive: boolean) =>
    isOverridden ? urlLayers.includes(layerPresentationId) : dbActive

  return { layers, urlLayers, isOverridden, setLayers, setLayerVisible, isLayerVisible }
}
