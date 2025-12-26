import * as ReactDOMServer from 'react-dom/server'
import { Marker } from 'react-leaflet'
import { MdNotListedLocation } from 'react-icons/md'

import styles from './Marker.module.css'

export const InfoMarker = ({ mapInfo }) => {
  if (!mapInfo?.lat) return null

  return (
    <Marker
      position={{ lat: mapInfo.lat, lng: mapInfo.lng }}
      icon={L.divIcon({
        html: ReactDOMServer.renderToString(
          <MdNotListedLocation className={styles.icon} />,
        ),
      })}
    />
  )
}
