import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../../ElectricProvider.tsx'

export const WmsLegend = memo(({ layer }) => {
  // need to fetch wms_service_layers with this layers wms_service_layer_name
  const { db } = useElectric()!
  const { results: wmsServiceLayer } = useLiveQuery(
    db.wms_service_layers.liveFirst({
      where: { name: layer.wms_service_layer_name },
    }),
  )

  return (
    <>
      {wmsServiceLayer?.legend_image ? (
        <img
          src={`data:image/png;base64,${btoa(
            String.fromCharCode(
              ...new Uint8Array(wmsServiceLayer?.legend_image),
            ),
          )}`}
        />
      ) : wmsServiceLayer?.legend_url ? (
        <img src={wmsServiceLayer.legend_url} />
      ) : (
        'No legend available'
      )}
    </>
  )
})
