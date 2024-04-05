import { useLiveQuery } from 'electric-sql/react'

import { NavsWrapping } from './Wrapping'
import { NavsOverflowing } from './Overflowing'
import { useElectric } from '../../../ElectricProvider'
import { user_id } from '../../SqlInitializer'

export const Navs = () => {
  const { db } = useElectric()!
  // get app_states.navs_overflowing
  const { results: uiOption } = useLiveQuery(
    db.app_states.liveUnique({ where: { user_id } }),
  )
  const designing = uiOption?.designing ?? false

  if (uiOption?.navs_overflowing === undefined) {
    return <div className="navs" />
  }

  if (uiOption?.navs_overflowing === false) {
    return <NavsWrapping designing={designing} />
  }

  return <NavsOverflowing designing={designing} />
}
