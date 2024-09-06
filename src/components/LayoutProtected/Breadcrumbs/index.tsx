import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { BreadcrumbsWrapping } from './Wrapping.tsx'
import { BreadcrumbsOverflowing } from './Overflowing/index.tsx'
import { useElectric } from '../../../ElectricProvider.tsx'
import './breadcrumb.css'

export const Breadcrumbs = () => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  if (appState?.breadcrumbs_overflowing === false) {
    return <BreadcrumbsWrapping />
  }

  return <BreadcrumbsOverflowing />
}
