import { Outlet, useLocation, useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { VectorLayerWithDisplays } from '../../../../../../formsAndLists/vectorLayer/WithDisplays.tsx'

const from = '/data/projects/$projectId_/vector-layers/$vectorLayerId_'

export const VectorLayerLayout = () => {
  const { projectId, vectorLayerId } = useParams({ strict: false })
  const location = useLocation()

  const res = useLiveQuery(
    `SELECT vlds_in_vector_layer FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const vldsInVectorLayer = res?.rows?.[0]?.vlds_in_vector_layer !== false

  const baseUrl = `/data/projects/${projectId}/vector-layers/${vectorLayerId}`
  const isBaseRoute =
    location.pathname === baseUrl || location.pathname === `${baseUrl}/`
  const isVectorLayerRoute = location.pathname === `${baseUrl}/vector-layer`
  const isDisplaysRoute =
    location.pathname === `${baseUrl}/displays` ||
    location.pathname.startsWith(`${baseUrl}/displays/`)

  if (vldsInVectorLayer && (isBaseRoute || isVectorLayerRoute || isDisplaysRoute)) {
    return <VectorLayerWithDisplays from={from} />
  }
  return <Outlet />
}
