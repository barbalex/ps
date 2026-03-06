import { useState, useEffect, useCallback } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import { MdCenterFocusWeak } from 'react-icons/md'
import * as ReactDOMServer from 'react-dom/server'
import { useBeforeunload } from 'react-beforeunload'

import styles from './CenterMarker.module.css'

export const CenterMarker = () => {
  const map = useMap()

  const [center, setCenter] = useState(() => {
    if (!map) return null
    return map.getBounds().getCenter()
  })

  const setCenterFromMap = useCallback(() => {
    if (!map) return
    const bounds = map.getBounds()
    const center = bounds.getCenter()

    setCenter(center)
  }, [map])

  useEffect(() => {
    map.on('move', setCenterFromMap)
  }, [map, setCenterFromMap])

  useBeforeunload(() => {
    console.log('CenterMarker removing map event listener')
    map.off('move', setCenterFromMap)
  })

  if (!center) return null

  return (
    <Marker
      position={center}
      icon={L.divIcon({
        html: ReactDOMServer.renderToString(
          <MdCenterFocusWeak className={styles.icon} />,
        ),
      })}
    >
      <Popup>Map Center</Popup>
    </Marker>
  )
}
