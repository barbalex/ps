import { createFileRoute } from '@tanstack/react-router'

import { Project } from '../../../../formsAndLists/project/index.tsx'

export const Route = createFileRoute('/data/_authLayout/projects/$projectId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Project />
}
