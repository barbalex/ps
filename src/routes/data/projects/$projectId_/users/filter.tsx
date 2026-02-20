import { createFileRoute } from '@tanstack/react-router'

import { ProjectUserFilter } from '../../../../../formsAndLists/projectUser/Filter.tsx'

const from = '/data/projects/$projectId_/users/filter'

export const Route = createFileRoute(from)({
  component: () => <ProjectUserFilter from={from} />,
})
