import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../../ElectricProvider.tsx'

const containerStyle = {
  padding: 10,
}
const titleStyle = {
  fontWeight: 'bold',
  paddingBottom: 5,
}

export const Legend = memo(({ layer, isLast }) => {
  // need to fetch wms_service_layers with this layers wms_service_layer_name
  const { db } = useElectric()!
  const { results: wmsServiceLayer } = useLiveQuery(
    db.wms_service_layers.liveFirst({
      where: { name: layer.wms_service_layer_name },
    }),
  )

  return (
    <section
      style={{
        ...containerStyle,
        borderTop: '1px solid rgba(55, 118, 28, 0.5)',
        ...(isLast ? { borderBottom: '1px solid rgba(55, 118, 28, 0.5)' } : {}),
      }}
    >
      <div style={titleStyle}>{layer.label}</div>
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
    </section>
  )
})