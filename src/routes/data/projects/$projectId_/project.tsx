import { createFileRoute } from '@tanstack/react-router'

import { Project } from '../../../../formsAndLists/project/index.tsx'
import { NotFound } from '../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/project')({
  component: RouteComponent,
  notFoundComponent: NotFound,
  beforeLoad: () => ({
    navDataFetcher: 'useProjectProjectNavData',
  }),
})

const RouteComponent = () => {
  return <Project from={'/data/projects/$projectId_/project'} />
}
