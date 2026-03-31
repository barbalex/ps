import { createFileRoute, Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { ListWithValues } from '../../../../../../formsAndLists/list/WithValues.tsx'

const from = '/data/projects/$projectId_/lists/$listId_'

const ListLayout = () => {
  const { projectId, listId } = useParams({ strict: false })
  const location = useLocation()

  const res = useLiveQuery(
    `SELECT list_values_in_list FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const listValuesInList = res?.rows?.[0]?.list_values_in_list !== false

  const baseUrl = `/data/projects/${projectId}/lists/${listId}`
  const isBaseRoute = location.pathname === baseUrl || location.pathname === `${baseUrl}/`
  const isListRoute = location.pathname === `${baseUrl}/list`
  const isValuesRoute =
    location.pathname === `${baseUrl}/values` ||
    location.pathname.startsWith(`${baseUrl}/values/`)

  if (listValuesInList && (isBaseRoute || isListRoute || isValuesRoute)) {
    return <ListWithValues from={from} />
  }
  return <Outlet />
}

export const Route = createFileRoute(
  '/data/projects/$projectId_/lists/$listId_',
)({
  component: ListLayout,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.listId || params.listId === 'undefined') {
      throw new Error('Invalid or missing listId in route parameters')
    }
    return {
      navDataFetcher: 'useListNavData',
    }
  },
})
