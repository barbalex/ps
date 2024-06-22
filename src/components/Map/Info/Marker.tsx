import { memo } from 'react'
import * as ReactDOMServer from 'react-dom/server'
import { Marker } from 'react-leaflet'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { MdNotListedLocation } from 'react-icons/md'

import { useElectric } from '../../../ElectricProvider.tsx'

export const InfoMarker = memo(() => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const mapInfo = appState?.map_info

  const location = mapInfo?.[0]

  if (!location) return null

  return (
    <Marker
      position={location}
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
})
