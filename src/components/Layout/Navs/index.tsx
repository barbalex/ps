import { useLiveQuery } from 'electric-sql/react'
import { useCorbadoSession } from '@corbado/react'

import { NavsWrapping } from './Wrapping'
import { NavsOverflowing } from './Overflowing'
import { useElectric } from '../../../ElectricProvider'

export const Navs = () => {
  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!
  // get app_states.navs_overflowing
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { authenticated_email: authUser.email } }),
  )
  const designing = appState?.designing ?? false

  if (appState?.navs_overflowing === undefined) {
    return <div className="navs" />
  }

  if (appState?.navs_overflowing === false) {
    return <NavsWrapping designing={designing} />
  }

  return <NavsOverflowing designing={designing} />
}
