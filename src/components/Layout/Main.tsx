import { useMemo } from 'react'
import { Outlet, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { Allotment } from 'allotment'

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

  const { db } = useElectric()!
  const { results: uiOption } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const tabs = useMemo(() => uiOption?.tabs ?? [], [uiOption?.tabs])
  const designing = uiOption?.designing ?? false

  // console.log('hello Main', { tabs })
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
