import { Outlet, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { ActionWithAll } from '../../../../../../../../../../../../formsAndLists/action/WithAll.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_'

export const FilesWrapper = () => {
  const { projectId } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT files_in_action FROM place_levels WHERE project_id = $1 AND level = 2`,
    [projectId],
  )
  const filesInAction = res?.rows?.[0]?.files_in_action !== false
  if (filesInAction) return <ActionWithAll from={from} />
  return <Outlet />
}
