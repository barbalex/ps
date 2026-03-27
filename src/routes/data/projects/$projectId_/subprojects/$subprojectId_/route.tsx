import { createFileRoute } from '@tanstack/react-router'
import { SubprojectLayout } from './-layout.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_',
)({
  component: SubprojectLayout,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    return {
      navDataFetcher: 'useSubprojectNavData',
    }
  },
})
