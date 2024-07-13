import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../../ElectricProvider.tsx'

const containerStyle = {
  padding: 10,
}
const titleStyle = {
  fontWeight: 'bold',
}

export const Legend = memo(({ layer }) => {
  // need to fetch wms_service_layers with this layers wms_service_layer_name
  const { db } = useElectric()!
  const { results: wmsServiceLayer } = useLiveQuery(
    db.wms_service_layers.liveFirst({
      where: { name: layer.wms_service_layer_name },
    }),
  )
  console.log('Legend', { layer, wmsServiceLayer })

  return (
    <section style={containerStyle}>
      <div style={titleStyle}>{layer.label}</div>
    </section>
  )
})
