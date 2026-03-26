import { createFileRoute, Outlet, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { ActionWithAll } from '../../../../../../../../../../../formsAndLists/action/WithAll.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_'

const FilesWrapper = () => {
  const { projectId } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT files_in_action FROM place_levels WHERE project_id = $1 AND level = 1`,
    [projectId],
  )
  if (!res) return null
  const filesInAction = res.rows?.[0]?.files_in_action !== false
  if (filesInAction) return <ActionWithAll from={from} />
  return <Outlet />
}

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/files',
)({
  component: FilesWrapper,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (!params.placeId || params.placeId === 'undefined') {
      throw new Error('Invalid or missing placeId in route parameters')
    }
    if (!params.actionId || params.actionId === 'undefined') {
      throw new Error('Invalid or missing actionId in route parameters')
    }
    return {
      navDataFetcher: 'useFilesNavData',
    }
  },
})
