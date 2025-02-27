import { memo } from 'react'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

export const WmsLegend = memo(({ layer }) => {
  // need to fetch wms_service_layers with this layers wms_service_layer_name
  const res = useLiveIncrementalQuery(
    `SELECT * FROM wms_service_layers WHERE name = $1`,
    [layer.wms_service_layer_name],
    'wms_service_layer_id',
  )
  const wmsServiceLayer = res?.rows?.[0]

  if (wmsServiceLayer?.legend_image) {
    return (
      <img
        src={`data:image/png;base64,${btoa(
          String.fromCharCode(...new Uint8Array(wmsServiceLayer?.legend_image)),
        )}`}
      />
    )
  }
  if (wmsServiceLayer?.legend_url) {
    return <img src={wmsServiceLayer.legend_url} />
  }

  return 'No legend available'
})
