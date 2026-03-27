import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Project } from './index.tsx'

export const ProjectIndex = ({ from }: { from: string }) => {
  const { projectId } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT files_active_projects, project_files_in_project FROM projects WHERE project_id = $1`,
    [projectId],
  )
  if (res === undefined) return null

  const showFiles = res?.rows?.[0]?.files_active_projects !== false
  const filesInProject = res?.rows?.[0]?.project_files_in_project !== false

  // Parent layout renders ProjectWithFiles when files are shown inline.
  if (showFiles && filesInProject) return null
  return <Project from={from} />
}
