import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Check } from './Check.tsx'
import { CheckList } from './List.tsx'

export const CheckIndex = ({
  from,
  isRootRoute = false,
}: {
  from: string
  isRootRoute?: boolean
}) => {
  const { projectId, placeId2 } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT check_quantities_in_check, check_taxa_in_check, check_files, check_files_in_check FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  if (res === undefined) return null
  const quantitiesInCheck = res?.rows?.[0]?.check_quantities_in_check !== false
  const taxaInCheck = res?.rows?.[0]?.check_taxa_in_check !== false
  const filesInCheck =
    res?.rows?.[0]?.check_files !== false &&
    res?.rows?.[0]?.check_files_in_check !== false

  // Layout route renders CheckWithAll when any sub-section is enabled
  if (quantitiesInCheck || taxaInCheck || filesInCheck) return null
  if (isRootRoute) return <CheckList from={from} />
  return <Check from={from} />
}
