import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { NavsWrapping } from './Wrapping.tsx'
import { NavsOverflowing } from './Overflowing/index.tsx'
import { useElectric } from '../../../ElectricProvider.tsx'

export const Navs = () => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  // get app_states.navs_overflowing
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const designing = appState?.designing ?? false

  // console.log('Navs index rendering, appState:', appState)

  if (appState?.navs_overflowing === undefined) {
    return <div className="navs" />
  }

  if (appState?.navs_overflowing === false) {
    return <NavsWrapping designing={designing} />
  }

  return <NavsOverflowing designing={designing} />
}
