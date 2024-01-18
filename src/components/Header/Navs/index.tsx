import { useLiveQuery } from 'electric-sql/react'

import { NavsWrapping } from './Wrapping'
import { NavsOverflowing } from './Overflowing'
import { useElectric } from '../../../ElectricProvider'
import { user_id } from '../../SqlInitializer'
import { UiOptions as UiOption } from '../../../generated/client'

export const Navs = () => {
  const { db } = useElectric()!
  // get ui_options.navs_overflowing
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )

  const uiOption: UiOption = results

  console.log('Navs, navsOverflowing:', uiOption?.navs_overflowing)

  if (uiOption?.navs_overflowing === undefined) {
    return null
  }

  if (uiOption?.navs_overflowing === false) {
    console.log('Navs, NavsWrapping')
    return <NavsWrapping />
  }

  return <NavsOverflowing />
}
