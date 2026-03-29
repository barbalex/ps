import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { ActionWithAll } from '../../../../../../../../../../../../formsAndLists/action/WithAll.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_'

export const ActionLayout = () => {
  const location = useLocation()
  const { projectId } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT action_quantities_in_action, action_taxa_in_action, action_files_in_action FROM place_levels WHERE project_id = $1 AND level = 2`,
    [projectId],
  )
  const quantitiesInAction =
    res?.rows?.[0]?.action_quantities_in_action !== false
  const taxaInAction = res?.rows?.[0]?.action_taxa_in_action !== false
  const filesInAction = res?.rows?.[0]?.action_files_in_action !== false
  const allInline = quantitiesInAction && taxaInAction && filesInAction
  const isQuantitiesRoute = /\/quantities(\/|$)/.test(location.pathname)
  const isTaxaRoute = /\/taxa(\/|$)/.test(location.pathname)
  const isFilesRoute = /\/files(\/|$)/.test(location.pathname)
  const isSubsectionRoute =
    isQuantitiesRoute || isTaxaRoute || isFilesRoute
  const shouldRenderWithAll = isSubsectionRoute
    ? (isQuantitiesRoute && quantitiesInAction) ||
      (isTaxaRoute && taxaInAction) ||
      (isFilesRoute && filesInAction)
    : quantitiesInAction || taxaInAction || filesInAction
  const isTaxaListRoute = /\/taxa\/?$/.test(location.pathname)
  if (isTaxaListRoute && !taxaInAction) return <Outlet />
  if (shouldRenderWithAll)
    return <ActionWithAll from={from} allInline={allInline} />
  return <Outlet />
}
