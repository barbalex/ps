import { useLiveQuery } from '@electric-sql/pglite-react'

import type WmsLayers from '../../../../models/public/WmsLayers.ts'
import type WmsServiceLayers from '../../../../models/public/WmsServiceLayers'

export const WmsLegend = ({ layer }: { layer: WmsLayers }) => {
  // need to fetch wms_service_layers with this layers wms_service_layer_name
  const res = useLiveQuery(`SELECT * FROM wms_service_layers WHERE name = $1`, [
    layer.wms_service_layer_name,
  ])
  const wmsServiceLayer = res?.rows?.[0] as WmsServiceLayers | undefined

  if (wmsServiceLayer?.legend_image) {
    return (
      <img
        src={`data:image/png;base64,${btoa(
          String.fromCharCode(
            ...new Uint8Array(wmsServiceLayer?.legend_image as ArrayBuffer),
          ),
        )}`}
      />
    )
  }
  if (wmsServiceLayer?.legend_url) {
    return <img src={wmsServiceLayer.legend_url} />
  }

  return 'No legend available'
}
