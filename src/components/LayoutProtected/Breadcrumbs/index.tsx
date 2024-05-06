import { useLiveQuery } from 'electric-sql/react'
import { useCorbadoSession } from '@corbado/react'

import { BreadcrumbsWrapping } from './Wrapping'
import { BreadcrumbsOverflowing } from './Overflowing'
import { useElectric } from '../../../ElectricProvider.tsx'

export const Breadcrumbs = () => {
  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  if (appState?.breadcrumbs_overflowing === false) {
    return <BreadcrumbsWrapping />
  }

  return <BreadcrumbsOverflowing />
}
