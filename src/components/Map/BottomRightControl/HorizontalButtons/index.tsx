import { useRef, useEffect } from 'react'

import { ScaleSwitchControl } from './ScaleSwitchControl/index.tsx'
import { ScaleControl } from './ScaleControl.tsx'
import { CoordinatesControl } from './Coordinates/index.tsx'

const horizontalbuttonsStyle = {
  gridArea: 'horizontalbuttons',
  zIndex: 1000,
  backgroundColor: 'white',
  borderRadius: 4,
  margin: 0,
  cursor: 'auto',
  position: 'relative',
  pointerEvents: 'auto',
  userSelect: 'none',
  display: 'flex',
  flexWrap: 'nowrap',
  flexDirection: 'row',
  alignItems: 'stretch',
  padding: 5,
  columnGap: 5,
}

// TODO: add: ruler, coordinates
export const HorizontalButtons = () => {
  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  return (
    <div
      style={horizontalbuttonsStyle}
      ref={ref}
    >
      <ScaleControl />
      <ScaleSwitchControl />
      <CoordinatesControl />
    </div>
  )
}
