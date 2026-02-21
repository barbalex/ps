import { createFileRoute } from '@tanstack/react-router'

import { Person } from '../../../../../formsAndLists/person/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/persons/$personId/',
)({
  component: Person,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.personId || params.personId === 'undefined') {
      throw new Error('Invalid or missing personId in route parameters')
    }
    return {
      navDataFetcher: 'usePersonNavData',
    }
  },
})
