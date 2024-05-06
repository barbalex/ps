import { useMemo, memo } from 'react'
import { Outlet } from 'react-router-dom'
// import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { Allotment } from 'allotment'
import { useCorbadoSession } from '@corbado/react'

import { useElectric } from '../../ElectricProvider.tsx'
import { Tree } from '../Tree'
import { Filter } from '../Filter'
import { Map } from '../Map'

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
  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!
  const { results: appStateByEmail } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const tabs = useMemo(
    () => appStateByEmail?.tabs ?? [],
    [appStateByEmail?.tabs],
  )
  const designing = appStateByEmail?.designing ?? false

  if (onlyForm) return <Outlet />

  return (
    <div style={containerStyle}>
      <Allotment>
        {tabs.includes('tree') && <Tree designing={designing} />}
        {tabs.includes('data') && <Outlet />}
        {tabs.includes('filter') && <Filter />}
        {tabs.includes('map') && <Map />}
      </Allotment>
    </div>
  )
})
