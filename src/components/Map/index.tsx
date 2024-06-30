import { memo } from 'react'

import { Map } from './Map.tsx'
import { MapInfo } from './Info/index.tsx'

const containerStyle = {
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
}

export const MapContainer = memo(() => (
  <div style={containerStyle}>
    <Map />
    <MapInfo />
  </div>
))
