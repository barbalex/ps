import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Action } from './Action.tsx'
import { ActionList } from './List.tsx'

export const ActionIndex = ({
  from,
  isRootRoute = false,
}: {
  from: string
  isRootRoute?: boolean
}) => {
  const { projectId, placeId2 } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT action_quantities_in_action, action_taxa_in_action, action_files_in_action FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  if (res === undefined) return null
  const quantitiesInAction =
    res?.rows?.[0]?.action_quantities_in_action !== false
  const taxaInAction = res?.rows?.[0]?.action_taxa_in_action !== false
  const filesInAction = res?.rows?.[0]?.action_files_in_action !== false

  // Layout route renders ActionWithAll when any sub-section is enabled
  if (quantitiesInAction || taxaInAction || filesInAction) return null
  if (isRootRoute) return <ActionList from={from} />
  return <Action from={from} />
}
