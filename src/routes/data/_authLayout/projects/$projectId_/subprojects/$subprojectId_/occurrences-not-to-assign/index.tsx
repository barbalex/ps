import { createFileRoute, useParams } from '@tanstack/react-router'

import { Occurrences } from '../../../../../../../../formsAndLists/occurrences.tsx'
import { NotFound } from '../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/occurrences-not-to-assign/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  const { projectId, subprojectId } = useParams({
    from: '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/occurrences-not-to-assign/',
  })
  return (
    <Occurrences
      isNotToAssign={true}
      projectId={projectId}
      subprojectId={subprojectId}
    />
  )
}
