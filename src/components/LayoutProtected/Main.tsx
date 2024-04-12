import { useMemo, memo, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
// import { useSearchParams } from 'react-router-dom'
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

export const Main = memo(() => {
  // onlyForm is a query parameter that allows the user to view a form without the rest of the app
  // used for popups inside the map
  // TODO: this renders on every navigation!!! This temporarily disabled
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

  // test querying
  const { results: appStateById } = useLiveQuery(
    db.app_states.liveUnique({
      where: { app_state_id: '018ec37d-54b7-7d95-8bd9-a9117e1e7491' },
    }),
  )
  const { results: appStatesMany } = useLiveQuery(db.app_states.liveMany())
  // test querying projects
  const { results: projects } = useLiveQuery(db.projects.liveMany())

  console.log('from render', {
    appStateByEmail,
    appStateById,
    db,
    authUserEmail: authUser?.email,
    appStatesMany,
    projects,
  })

  useEffect(() => {
    const run = async () => {
      const appStatesFromRawQuery = await db.rawQuery({
        sql: `select * from app_states;`,
      })
      console.log(
        'from useEffect, appStates from raw query:',
        appStatesFromRawQuery,
      )
      try {
        const appStatesFromFindMany = await db.app_states.findMany()
        console.log(
          'from useEffect, appStatesFromFindMany:',
          appStatesFromFindMany,
        )
      } catch (error) {
        console.error('from useEffect, appStatesFromFindMany error:', error)
      }
      try {
        const appStatesFromFindUnique = await db.app_states.findUnique({
          where: { app_state_id: '018ec37d-54b7-7d95-8bd9-a9117e1e7491' },
        })
        console.log(
          'from useEffect, appStatesFromFindUnique:',
          appStatesFromFindUnique,
        )
      } catch (error) {
        console.error('from useEffect, appStatesFromFindUnique error:', error)
      }
      try {
        const appStatesFromFindFirst = await db.app_states.findFirst({
          where: { user_email: authUser?.email },
        })
        console.log(
          'from useEffect, appStatesFromFindFirst:',
          appStatesFromFindFirst,
        )
      } catch (error) {
        console.error('from useEffect, appStatesFromFindFirst error:', error)
      }
    }
    run()
  }, [])

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
