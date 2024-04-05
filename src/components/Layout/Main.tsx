import { useMemo } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { Allotment } from 'allotment'
import { useCorbadoSession } from '@corbado/react'

import { useElectric } from '../../ElectricProvider'
import { user_id } from '../SqlInitializer'
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
  const { results: user } = useLiveQuery(
    db.users.liveFirst({
      where: { email: authUser.email },
      // include: { app_states: true },
    }),
  )
  const { results: uiOption } = useLiveQuery(
    db.app_states.liveUnique({ where: { user_id } }),
  )
  const tabs = useMemo(() => uiOption?.tabs ?? [], [uiOption?.tabs])
  const designing = uiOption?.designing ?? false

  console.log('hello Main Layout')
  console.log('hello Main Layout', { authUser, user })
  if (onlyForm) {
    return <Outlet />
  }

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
