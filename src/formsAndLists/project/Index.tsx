import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'

import { Project } from './index.tsx'
import { designingAtom } from '../../store.ts'

export const ProjectIndex = ({ from }: { from: string }) => {
  const { projectId } = useParams({ strict: false })
  const [isDesigning] = useAtom(designingAtom)
  const res = useLiveQuery(
    `SELECT files_active_projects, project_users_in_project, project_files_in_project, units_in_project, fields_in_project, project_reports_in_project FROM projects WHERE project_id = $1`,
    [projectId],
  )
  if (res === undefined) return null

  const showFiles = res?.rows?.[0]?.files_active_projects !== false
  const usersInProject = res?.rows?.[0]?.project_users_in_project !== false
  const filesInProject = res?.rows?.[0]?.project_files_in_project === true
  const unitsInProject = res?.rows?.[0]?.units_in_project !== false
  const fieldsInProject = res?.rows?.[0]?.fields_in_project !== false
  const reportsInProject = res?.rows?.[0]?.project_reports_in_project !== false

  // Parent layout renders ProjectWithFiles when inline sub-sections are enabled.
  if (
    (isDesigning && usersInProject) ||
    reportsInProject ||
    (isDesigning && unitsInProject) ||
    (isDesigning && fieldsInProject) ||
    (showFiles && filesInProject)
  ) {
    return null
  }
  return <Project from={from} />
}
