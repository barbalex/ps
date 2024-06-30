import { memo, useRef } from 'react'

import { Map } from './Map.tsx'
import { Info } from './Info/index.tsx'

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
      <Map  />
      <Info containerRef={containerRef} />
    </div>
  )
})
