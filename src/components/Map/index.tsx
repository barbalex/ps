import { memo } from 'react'

import { Map } from './Map.tsx'
import { Info } from './Info/index.tsx'

const containerStyle = {
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  containerType: 'inline-size',
}

export const MapContainer = memo(() => (
  <div style={containerStyle}>
    <Map />
    <Info />
  </div>
))
