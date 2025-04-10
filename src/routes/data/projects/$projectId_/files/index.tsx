import { createFileRoute, useParams } from '@tanstack/react-router'

import { Files } from '../../../../../formsAndLists/files.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/files/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  const { projectId } = useParams({
    from: '/data/projects/$projectId_/files/',
  })

  return <Files projectId={projectId} />
}
