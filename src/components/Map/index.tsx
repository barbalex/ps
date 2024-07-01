import { memo, useRef } from 'react'

import { Map } from './Map.tsx'
import { InfoContainer } from './InfoContainer/index.tsx'
import { LayersContainer } from './LayersContainer/index.tsx'

const containerStyle = {
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  containerType: 'inline-size',
}

export const MapContainer = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div style={containerStyle} ref={containerRef}>
      <LayersContainer containerRef={containerRef} />
      <Map />
      <InfoContainer containerRef={containerRef} />
    </div>
  )
})
