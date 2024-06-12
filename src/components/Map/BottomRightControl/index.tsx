import { useRef, useEffect, memo } from 'react'

const innerDivStyle = {
  border: 'none !important',
  boxShadow: 'none !important',
  // float children right
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
}

// TODO: only prevent click propagation in active grid areas
export const BottomRightControl = memo(() => {
  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  return (
    <div className="leaflet-control-container first" ref={ref}>
      <div className="leaflet-bottom leaflet-right">
        <div style={innerDivStyle} className="leaflet-control leaflet-bar">
          Bottom Right control
        </div>
      </div>
    </div>
  )
})
