import { createFileRoute } from '@tanstack/react-router'

import { Person } from '../../../../../formsAndLists/person/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/persons/$personId/',
)({
  component: Person,
  beforeLoad: () => ({
    navDataFetcher: 'usePersonNavData',
  }),
})
