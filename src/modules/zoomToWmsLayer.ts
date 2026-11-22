import type * as L from 'leaflet'

import { extentToBoundsWithMargin, type Extent, type QueryableDb } from './geoQueries.ts'
import type WmsLayers from '../models/public/WmsLayers.ts'

type Props = {
  db: QueryableDb
  // wms_layers row
  layer: WmsLayers
  addNotification: (notification: {
    title: string
    intent: 'info'
  }) => unknown
  setMapBounds: (bounds: L.LatLngBoundsExpression) => void
}

/**
 * Zooms the map to the extent of a WMS layer, as advertised by the
 * service's capabilities and stored on the wms_service_layers row at
 * capabilities-fetch time (reprojected to WGS84). Offline-safe: no live
 * capabilities request. Counterpart of zoomToVectorLayer for the layer
 * drawer's active-section rows.
 */
export const zoomToWmsLayer = async ({
  db,
  layer,
  addNotification,
  setMapBounds,
}: Props): Promise<void> => {
  const res = await db.query<{ extent: Extent | null }>(
    `SELECT extent FROM wms_service_layers WHERE wms_service_id = $1 AND name = $2`,
    [layer.wms_service_id, layer.wms_service_layer_name],
  )
  const extent = res?.rows?.[0]?.extent
  if (!extent) {
    return void addNotification({
      title: 'No extent found for this layer',
      intent: 'info',
    })
  }
  setMapBounds(extentToBoundsWithMargin(extent))
}
