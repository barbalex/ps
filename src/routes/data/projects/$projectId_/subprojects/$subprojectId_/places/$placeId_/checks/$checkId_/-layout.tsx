import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { CheckWithAll } from '../../../../../../../../../../formsAndLists/check/WithAll.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/check'

export const CheckLayout = () => {
  const location = useLocation()
  const { projectId } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT check_quantities_in_check, check_taxa_in_check, check_files, check_files_in_check FROM place_levels WHERE project_id = $1 AND level = 1`,
    [projectId],
  )
  const quantitiesInCheck = res?.rows?.[0]?.check_quantities_in_check !== false
  const taxaInCheck = res?.rows?.[0]?.check_taxa_in_check !== false
  const filesInCheck =
    res?.rows?.[0]?.check_files !== false &&
    res?.rows?.[0]?.check_files_in_check !== false
  const allInline = quantitiesInCheck && taxaInCheck && filesInCheck
  const isCheckHistoryRoute =
    location.pathname.includes('/histories/') &&
    !location.pathname.includes('/quantities/') &&
    !location.pathname.includes('/taxa/') &&
    !location.pathname.includes('/files/')
  if ((quantitiesInCheck || taxaInCheck || filesInCheck) && !isCheckHistoryRoute)
    return <CheckWithAll from={from} allInline={allInline} />
  return <Outlet />
}
