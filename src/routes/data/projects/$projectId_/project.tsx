import { createFileRoute } from '@tanstack/react-router'

import { ProjectIndex } from '../../../../formsAndLists/project/Index.tsx'
import { NotFound } from '../../../../components/NotFound.tsx'

const from = '/data/projects/$projectId_/project'

export const Route = createFileRoute(from)({
  component: () => <ProjectIndex from={from} />,
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
