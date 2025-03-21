import { createFileRoute } from '@tanstack/react-router'

import { NotFound } from '../../../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/users/',
)({
  component: RouteComponent,
  notFoundComponent: NotFound,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/users/"!
    </div>
  )
}
