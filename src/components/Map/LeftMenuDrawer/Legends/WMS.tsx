import { memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { usePGlite } from '@electric-sql/pglite-react'

export const WmsLegend = memo(({ layer }) => {
  // need to fetch wms_service_layers with this layers wms_service_layer_name
  const db = usePGlite()
  const { results: wmsServiceLayer } = useLiveQuery(
    db.wms_service_layers.liveFirst({
      where: { name: layer.wms_service_layer_name },
    }),
  )

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
