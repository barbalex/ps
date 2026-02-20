import { createFileRoute } from '@tanstack/react-router'

import { Project } from '../../../../formsAndLists/project/index.tsx'
import { NotFound } from '../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/project')({
  component: <Project from="/data/projects/$projectId_/project" />,
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
