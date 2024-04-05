import { useLiveQuery } from 'electric-sql/react'

import { BreadcrumbsWrapping } from './Wrapping'
import { BreadcrumbsOverflowing } from './Overflowing'
import { useElectric } from '../../../ElectricProvider'
import { user_id } from '../../SqlInitializer'

export const Breadcrumbs = () => {
  const { db } = useElectric()!
  // get app_state.breadcrumbs_overflowing
  const { results: uiOption } = useLiveQuery(
    db.app_state.liveUnique({ where: { user_id } }),
  )

  if (uiOption?.breadcrumbs_overflowing === false) {
    return <BreadcrumbsWrapping />
  }

  return <BreadcrumbsOverflowing />
}
