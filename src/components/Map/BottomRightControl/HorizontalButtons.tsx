import { useRef, useEffect, memo } from 'react'

import { ScaleControl } from '../ScaleControl/index.tsx'

const horizontalbuttonsStyle = {
  gridArea: 'horizontalbuttons',
  zIndex: 1000,
  backgroundColor: 'white',
  borderRadius: 4,
  padding: '0 5px',
  margin: 0,
  cursor: 'auto',
  position: 'relative',
  pointerEvents: 'auto',
  userSelect: 'none',
  display: 'flex',
  flexWrap: 'nowrap',
  flexDirection: 'row',
  alignItems: 'center',
}

// TODO: add: ruler, scale, coordinates
export const HorizontalButtons = memo(() => {
  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  return (
    <div style={horizontalbuttonsStyle} ref={ref}>
      <ScaleControl />
    </div>
  )
})
