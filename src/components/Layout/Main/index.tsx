import { useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { Allotment } from 'allotment'

import { useElectric } from '../../../ElectricProvider'
import { user_id } from '../../SqlInitializer'
import { Tree } from '../../Tree'
import { Filter } from '../../Filter'
import { Map } from '../../Map'

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflow: 'hidden',
  position: 'relative',
}

export const Main = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const tabs = useMemo(() => results?.tabs ?? [], [results?.tabs])

  console.log('Main, tabs:', tabs)

  return (
    <div style={containerStyle}>
      <Allotment>
        {tabs.includes('tree') && <Tree />}
        <Outlet />
        {tabs.includes('filter') && <Filter />}
        {tabs.includes('map') && <Map />}
      </Allotment>
    </div>
  )
}
