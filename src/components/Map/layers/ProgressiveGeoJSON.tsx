import { useEffect, useRef, useState } from 'react'
import * as L from 'leaflet'
import type { Feature, Geometry } from 'geojson'
import { useLeafletContext } from '@react-leaflet/core'

import {
  addProgressively,
  flattenGeoJSON,
  missingForReconcile,
  reconcileKey,
  type GeoJSONInput,
} from './progressiveGeoJSON.ts'

type Props = {
  /**
   * Arbitrary identity: when it changes, the layer is discarded and rebuilt
   * with the current props. The replacement for remounting react-leaflet's
   * <GeoJSON> via key — which builds every marker synchronously.
   */
  resetKey: string
  data: GeoJSONInput
  /**
   * Stable per-feature identity: when provided, data changes reconcile —
   * gone features are removed, new ones stream in progressively, unchanged
   * ones stay rendered — instead of clearing and refilling the whole layer.
   * Return undefined for features without a stable identity; those keep the
   * refill behavior. Without featureKey every data change rebuilds the
   * layer visibly.
   */
  featureKey?: (feature: Feature) => string | undefined
  chunkSize?: number
} & L.GeoJSONOptions &
  /** options leaflet does not know, like geomanIgnore */
  Record<string, unknown>

/**
 * Drop-in for react-leaflet's <GeoJSON> that adds its features in bounded
 * batches per animation frame, so map layers with many markers load without
 * blocking the UI. pointToLayer, style and onEachFeature behave exactly as
 * with <GeoJSON>, just invoked per batch. All props are captured when the
 * layer is (re)created — unlike <GeoJSON>, later prop changes apply only
 * through a changed resetKey (which is how every call site already works:
 * their keys change whenever the option inputs change) or, with featureKey,
 * through reconciling the data.
 */
export const ProgressiveGeoJSON = ({
  resetKey,
  data,
  featureKey,
  chunkSize,
  ...options
}: Props) => {
  const context = useLeafletContext()
  const layerRef = useRef<L.GeoJSON | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options
  const cancelRef = useRef<(() => void) | null>(null)
  const [fillError, setFillError] = useState<unknown>(null)

  // create the empty layer; a changed resetKey recreates it with fresh props
  useEffect(() => {
    const container = context.layerContainer ?? context.map
    const layerOptions: L.GeoJSONOptions = { ...optionsRef.current }
    if (context.pane) layerOptions.pane = context.pane
    const layer = new L.GeoJSON(undefined, layerOptions)
    layerRef.current = layer
    container.addLayer(layer)
    return () => {
      cancelRef.current?.()
      container.removeLayer(layer)
      layerRef.current = null
    }
  }, [resetKey, context])

  // (re)fill the layer when it was recreated or the data changed
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    const items = flattenGeoJSON(data)
    cancelRef.current?.()

    const addMissing = (missing: (Feature | Geometry)[]) => {
      cancelRef.current = addProgressively(
        missing,
        (chunk) => {
          try {
            layer.addData(chunk)
          } catch (error) {
            // surface through the layer's ErrorBoundary like the old
            // render-time GeoJSON construction did
            setFillError(error)
            return false
          }
        },
        { chunkSize },
      )
    }

    // mirror leaflet's asFeature wrapping via reconcileKey: items may be
    // bare geometries (the call sites spread geometry objects), while
    // rendered children always carry a wrapped feature — both must yield
    // the same key
    const keyOf = (item: Feature | Geometry | undefined) =>
      featureKey ? reconcileKey(item, featureKey) : undefined

    if (featureKey) {
      // reconcile: keep unchanged features rendered (a refetch after
      // zoom/pan must not blink the whole layer), remove gone ones,
      // stream in new ones
      const wanted = new Set(
        items
          .map(keyOf)
          .filter((k) => k !== undefined) as string[],
      )
      const existingKeys = new Set<string>()
      const stale: L.Layer[] = []
      layer.eachLayer((child) => {
        const key = keyOf(
          (child as L.Layer & { feature?: Feature }).feature,
        )
        if (key === undefined || !wanted.has(key)) {
          stale.push(child)
          return
        }
        existingKeys.add(key)
      })
      for (const child of stale) layer.removeLayer(child)
      addMissing(missingForReconcile(items, existingKeys, featureKey))
    } else {
      layer.clearLayers()
      addMissing(items)
    }
    return () => {
      cancelRef.current?.()
      cancelRef.current = null
    }
  }, [data, resetKey, chunkSize, featureKey])

  if (fillError) throw fillError

  return null
}
