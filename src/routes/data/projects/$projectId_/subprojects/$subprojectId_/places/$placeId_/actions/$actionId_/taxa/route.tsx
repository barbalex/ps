import { createFileRoute, Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { ActionTaxa } from '../../../../../../../../../../../formsAndLists/actionTaxa.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/taxa'

const TaxaRouteContent = () => {
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

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/taxa',
)({
  component: TaxaRouteContent,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (!params.placeId || params.placeId === 'undefined') {
      throw new Error('Invalid or missing placeId in route parameters')
    }
    if (!params.actionId || params.actionId === 'undefined') {
      throw new Error('Invalid or missing actionId in route parameters')
    }
    return {
      navDataFetcher: 'useActionTaxaNavData',
    }
  },
})
