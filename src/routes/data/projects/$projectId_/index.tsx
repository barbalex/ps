import { createFileRoute } from '@tanstack/react-router'

import { ProjectList } from '../../../../formsAndLists/project/List.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/')(
  {
    component: RouteComponent,
  },
)

const RouteComponent = () => {
  return <ProjectList from={'/data/projects/$projectId_/'} />
}
