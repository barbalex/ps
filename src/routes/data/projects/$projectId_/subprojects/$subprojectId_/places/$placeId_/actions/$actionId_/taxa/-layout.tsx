import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { ActionTaxa } from '../../../../../../../../../../../formsAndLists/actionTaxa.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/taxa'

export const TaxaLayout = () => {
  const location = useLocation()
  const { projectId } = useParams({ strict: false })
  const placeLevelRes = useLiveQuery(
    `SELECT action_taxa_in_action FROM place_levels WHERE project_id = $1 AND level = 1`,
    [projectId],
  )
  const taxaInAction = placeLevelRes?.rows?.[0]?.action_taxa_in_action !== false
  const isTaxaList = /\/taxa\/?$/.test(location.pathname)

  if (isTaxaList) {
    return <ActionTaxa from={from} hideTitle={taxaInAction} />
  }

  return <Outlet />
}
