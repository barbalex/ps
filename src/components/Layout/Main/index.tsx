import { useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../../ElectricProvider'
import { user_id } from '../../SqlInitializer'

const outletContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  overflow: 'hidden',
}

export const Main = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const tabs = useMemo(() => results?.tabs ?? [], [results?.tabs])

  console.log('Main, tabs:', tabs)

  return (
    <div style={outletContainerStyle}>
      <Outlet />
    </div>
  )
}
