import { getRouteApi } from '@tanstack/react-router'

import { Files } from '../../../../../formsAndLists/files.tsx'

const routeApi = getRouteApi('/data/projects/$projectId_/files/')

export const RouteComponent = () => {
  const { projectId } = routeApi.useParams()
  return <Files projectId={projectId} />
}
