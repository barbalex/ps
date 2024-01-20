import { useLiveQuery } from 'electric-sql/react'

import { BreadcrumbsWrapping } from './Wrapping'
import { BreadcrumbsOverflowing } from './Overflowing'
import { useElectric } from '../../../ElectricProvider'
import { user_id } from '../../SqlInitializer'
import { UiOptions as UiOption } from '../../../../generated/client'

export const Breadcrumbs = () => {
  const { db } = useElectric()!
  // get ui_options.breadcrumbs_overflowing
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )

  const uiOption: UiOption = results

  if (uiOption?.breadcrumbs_overflowing === false) {
    return <BreadcrumbsWrapping />
  }

  return <BreadcrumbsOverflowing />
}
