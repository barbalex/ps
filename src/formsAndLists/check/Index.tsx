import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Check } from './index.tsx'
import { CheckWithQuantities } from './WithQuantities.tsx'

export const CheckIndex = ({ from }) => {
  const { projectId, placeId2 } = useParams({ from })
  const res = useLiveQuery(
    `SELECT check_quantities_in_check FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  if (res === undefined) return null
  const quantitiesInCheck = res?.rows?.[0]?.check_quantities_in_check !== false
  return quantitiesInCheck ? (
    <CheckWithQuantities from={from} />
  ) : (
    <Check from={from} />
  )
}
