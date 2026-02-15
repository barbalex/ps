import { createFileRoute } from '@tanstack/react-router'

import { Project } from '../../../../formsAndLists/project/index.tsx'
import { NotFound } from '../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/project')({
  component: RouteComponent,
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    return {
      navDataFetcher: 'useProjectProjectNavData',
    }
  },
})

const RouteComponent = () => {
  return <Project from={'/data/projects/$projectId_/project'} />
}
