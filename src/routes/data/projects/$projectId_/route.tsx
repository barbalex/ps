import { createFileRoute } from '@tanstack/react-router'
import { ProjectLayout } from './-layout.tsx'

import { NotFound } from '../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/projects/$projectId_')({
  component: ProjectLayout,
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    return {
      navDataFetcher: 'useProjectNavData',
    }
  },
})
