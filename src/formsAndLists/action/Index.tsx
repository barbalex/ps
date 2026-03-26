import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Action } from './index.tsx'
import { ActionWithAll } from './WithAll.tsx'

export const ActionIndex = ({ from }) => {
  const { projectId, placeId2 } = useParams({ from })
  const res = useLiveQuery(
    `SELECT action_quantities_in_action, action_taxa_in_action FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  if (res === undefined) return null
  const quantitiesInAction =
    res?.rows?.[0]?.action_quantities_in_action !== false
  const taxaInAction = res?.rows?.[0]?.action_taxa_in_action !== false
  if (quantitiesInAction || taxaInAction) return <ActionWithAll from={from} />
  return <Action from={from} />
}
