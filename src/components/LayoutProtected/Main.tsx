import { useMemo } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { Allotment } from 'allotment'
import { useCorbadoSession } from '@corbado/react'

import { useElectric } from '../../ElectricProvider'
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

export const Main = () => {
  const [searchParams] = useSearchParams()
  const onlyForm = searchParams.get('onlyForm')
  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const tabs = useMemo(() => appState?.tabs ?? [], [appState?.tabs])
  const designing = appState?.designing ?? false

  console.log('hello Main', { onlyForm, tabs, designing, appState, tabs, db })

  if (onlyForm) return <Outlet />

  // Allotment prevents the map from drawing correctly
  // UNLESS: an empty div is rendered instead of a missing Map...???
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
}
