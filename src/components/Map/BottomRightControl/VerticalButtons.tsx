import { useRef, useEffect, memo } from 'react'

const verticalbuttonsStyle = {
  gridArea: 'verticalbuttons',
  backgroundColor: 'white',
  margin: 0,
}

export const VerticalButtons = memo(() => {
  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  return (
    <div style={verticalbuttonsStyle} className="leaflet-control" ref={ref}>
      vertical buttons
    </div>
  )
})
