import { createFileRoute } from '@tanstack/react-router'

import { ProjectList } from '../../../../formsAndLists/project/List.tsx'

export const Route = createFileRoute('/data/_authLayout/projects/$projectId/')({
  component: RouteComponent,
})

const RouteComponent = () => {
  return <ProjectList from={'/data/_authLayout/projects/$projectId/'} />
}
