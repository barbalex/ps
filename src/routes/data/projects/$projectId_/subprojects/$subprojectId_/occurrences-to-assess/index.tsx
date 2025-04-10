import { createFileRoute, useParams } from '@tanstack/react-router'

import { Occurrences } from '../../../../../../../formsAndLists/occurrences.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/occurrences-to-assess/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  const { projectId, subprojectId } = useParams({
    from: '/data/projects/$projectId_/subprojects/$subprojectId_/occurrences-to-assess/',
  })
  return (
    <Occurrences
      isToAssess={true}
      projectId={projectId}
      subprojectId={subprojectId}
    />
  )
}
