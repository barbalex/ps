import { createFileRoute } from '@tanstack/react-router'

import { ProjectQcFilter } from '../../../../../formsAndLists/projectQc/Filter.tsx'

const from = '/data/projects/$projectId_/qcs/filter'

export const Route = createFileRoute('/data/projects/$projectId_/qcs/filter')({
  component: () => <ProjectQcFilter from={from} />,
})
