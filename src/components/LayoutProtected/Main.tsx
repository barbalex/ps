import { useMemo, memo } from 'react'
import { Outlet } from 'react-router-dom'
// import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { Allotment } from 'allotment'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../ElectricProvider.tsx'
import { Tree } from '../Tree/index.tsx'
import { MapContainer } from '../Map/index.tsx'

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflow: 'hidden',
  position: 'relative',
}

export const Main = memo(() => {
  // onlyForm is a query parameter that allows the user to view a form without the rest of the app
  // used for popups inside the map
  // TODO: this renders on every navigation!!! Thus temporarily disabled
  // because of the searchParams? JES
  // seems not solvable with react-router: https://github.com/remix-run/react-router/discussions/9851
  // there is this pull request: https://github.com/remix-run/react-router/pull/10740
  // const [searchParams] = useSearchParams()
  // const onlyForm = searchParams.get('onlyForm')
  const onlyForm = false
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const tabs = useMemo(() => appState?.tabs ?? [], [appState?.tabs])
  const designing = appState?.designing ?? false
  const mapMaximized =
    (appState?.map_maximized && tabs.includes('map')) ?? false

  if (onlyForm) return <Outlet />

  return (
    <div style={containerStyle}>
      <Allotment>
        {!mapMaximized && tabs.includes('tree') && (
          <Tree designing={designing} />
        )}
        {!mapMaximized && tabs.includes('data') && <Outlet />}
        {tabs.includes('map') && <MapContainer />}
      </Allotment>
    </div>
  )
})
