import { useRef, useEffect } from 'react'

const innerDivStyle = {
  border: 'none !important',
  boxShadow: 'none !important',
  // float children right
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
}

// Classes used by Leaflet to position controls
const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
}

export const Control = ({ children, position, visible = true }) => {
  const positionClass =
    (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright

  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  return (
    <div
      className="leaflet-control-container first"
      ref={ref}
      style={visible ? {} : { visibility: 'hidden' }}
    >
      <div className={positionClass}>
        <div style={innerDivStyle} className="leaflet-control leaflet-bar">
          {children}
        </div>
      </div>
    </div>
  )
}
