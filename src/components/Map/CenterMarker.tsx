import { useState, useEffect, useCallback } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import { MdCenterFocusWeak } from 'react-icons/md'
import * as ReactDOMServer from 'react-dom/server'

export const CenterMarker = () => {
  const map = useMap()

  const [center, setCenter] = useState(null)

  const setCenterFromMap = useCallback(() => {
    if (!map) return
    const bounds = map.getBounds()
    const center = bounds.getCenter()

    setCenter(center)
  }, [map])

  useEffect(() => {
    if (center) return
    setCenterFromMap()
  }, [center, map, setCenterFromMap])

  useEffect(() => {
    map.on('move', setCenterFromMap)

    return () => {
      map.off('move', setCenterFromMap)
    }
  }, [map, setCenterFromMap])

  if (!center) return null

  return (
    <Marker
      position={center}
      icon={L.divIcon({
        html: ReactDOMServer.renderToString(
          <MdCenterFocusWeak
            style={{
              color: 'yellow',
              fontSize: '3.5em',
              transform: 'translate(-0.38em, -0.38em)',
              filter: 'drop-shadow(0 0 2px rgb(0 0 0 / 1))',
            }}
          />,
        ),
      })}
    >
      <Popup>Map Center</Popup>
    </Marker>
  )
}
