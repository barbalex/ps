import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { ActionWithAll } from '../../../../../../../../../../formsAndLists/action/WithAll.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_'

export const ActionLayout = () => {
  const location = useLocation()
  const { projectId } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT action_quantities_in_action, action_taxa_in_action, action_files_in_action FROM place_levels WHERE project_id = $1 AND level = 1`,
    [projectId],
  )
  const quantitiesInAction =
    res?.rows?.[0]?.action_quantities_in_action !== false
  const taxaInAction = res?.rows?.[0]?.action_taxa_in_action !== false
  const filesInAction = res?.rows?.[0]?.action_files_in_action !== false
  const allInline = quantitiesInAction && taxaInAction && filesInAction
  const isHistoryRoute = location.pathname.includes('/histories/')
  if ((quantitiesInAction || taxaInAction || filesInAction) && !isHistoryRoute)
    return <ActionWithAll from={from} allInline={allInline} />
  return <Outlet />
}
