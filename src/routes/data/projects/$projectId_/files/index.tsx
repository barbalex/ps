import { createFileRoute } from '@tanstack/react-router'

import { Files } from '../../../../../formsAndLists/files.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

const RouteComponent = () => {
  const { projectId } = Route.useParams()
  return <Files projectId={projectId} />
}

export const Route = createFileRoute('/data/projects/$projectId_/files/')({
  component: RouteComponent,
  notFoundComponent: NotFound,
})
