import { useEffect, useRef, useState } from 'react'
import * as L from 'leaflet'
import { useLeafletContext } from '@react-leaflet/core'

import {
  addProgressively,
  flattenGeoJSON,
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
 * their keys change whenever the option inputs change).
 */
export const ProgressiveGeoJSON = ({
  resetKey,
  data,
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
    layer.clearLayers()
    cancelRef.current?.()
    cancelRef.current = addProgressively(
      items,
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
    return () => {
      cancelRef.current?.()
      cancelRef.current = null
    }
  }, [data, resetKey, chunkSize])

  if (fillError) throw fillError

  return null
}
