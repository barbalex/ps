import { useLiveQuery } from 'electric-sql/react'

import { NavsWrapping } from './Wrapping'
import { NavsOverflowing } from './Overflowing'
import { useElectric } from '../../../ElectricProvider'
import { user_id } from '../../SqlInitializer'

export const Navs = () => {
  const { db } = useElectric()!
  // get ui_options.navs_overflowing
  const { results: uiOption } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )

  if (uiOption?.navs_overflowing === undefined) {
    return <div className="navs" />
  }

  if (uiOption?.navs_overflowing === false) {
    return <NavsWrapping />
  }

  return <NavsOverflowing />
}
