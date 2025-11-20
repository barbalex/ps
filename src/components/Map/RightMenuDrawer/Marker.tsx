import * as ReactDOMServer from 'react-dom/server'
import { Marker } from 'react-leaflet'
import { MdNotListedLocation } from 'react-icons/md'

export const InfoMarker = ({ mapInfo }) => {
  if (!mapInfo?.lat) return null

  return (
    <Marker
      position={{ lat: mapInfo.lat, lng: mapInfo.lng }}
      icon={L.divIcon({
        html: ReactDOMServer.renderToString(
          <MdNotListedLocation
            style={{
              color: 'yellow',
              fontSize: '3.5em',
              transform: 'translate(-0.38em, -0.75em)',
              filter: 'drop-shadow(0 0 2px rgb(0 0 0 / 1))',
            }}
          />,
        ),
      })}
    />
  )
}
