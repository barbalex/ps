import { createFileRoute } from '@tanstack/react-router'

import { Project } from '../../../../formsAndLists/project/index.tsx'
import { NotFound } from '../../../../components/NotFound.tsx'

const from = '/data/projects/$projectId_/project'

export const Route = createFileRoute(from)({
  component: RouteComponent,
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    return {
      navDataFetcher: 'useProjectProjectNavData',
    }
  },
})

function RouteComponent() {
  return <Project from={from} />
}
