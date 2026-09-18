import * as ReactDOMServer from 'react-dom/server'
import * as L from 'leaflet'
import { Marker } from 'react-leaflet'
import { MdNotListedLocation } from 'react-icons/md'

import type { MapInfo } from '../../../store.ts'

import styles from './Marker.module.css'

export const InfoMarker = ({ mapInfo }: { mapInfo: MapInfo | null }) => {
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
