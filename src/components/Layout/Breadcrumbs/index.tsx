import { useLiveQuery } from 'electric-sql/react'
import { useCorbadoSession } from '@corbado/react'

import { BreadcrumbsWrapping } from './Wrapping'
import { BreadcrumbsOverflowing } from './Overflowing'
import { useElectric } from '../../../ElectricProvider'

export const Breadcrumbs = () => {
  const { user: authUser } = useCorbadoSession()
  const { db } = useElectric()!
  // get app_states.breadcrumbs_overflowing
  const { results: uiOption } = useLiveQuery(
    db.app_states.liveUnique({
      where: { authenticated_email: authUser.email },
    }),
  )

  if (uiOption?.breadcrumbs_overflowing === false) {
    return <BreadcrumbsWrapping />
  }

  return <BreadcrumbsOverflowing />
}
