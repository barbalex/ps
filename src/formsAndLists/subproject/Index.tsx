import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Subproject } from './index.tsx'

export const SubprojectIndex = ({ from }: { from: string }) => {
  const { projectId } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT files_active_subprojects, subproject_users_in_subproject, subproject_files_in_subproject FROM projects WHERE project_id = $1`,
    [projectId],
  )
  if (res === undefined) return null

  const showFiles = res?.rows?.[0]?.files_active_subprojects !== false
  const usersInSubproject =
    res?.rows?.[0]?.subproject_users_in_subproject !== false
  const filesInSubproject =
    res?.rows?.[0]?.subproject_files_in_subproject !== false

  // Parent layout renders SubprojectWithFiles when inline sub-sections are enabled.
  if (usersInSubproject || (showFiles && filesInSubproject)) return null
  return <Subproject from={from} />
}
