import { createFileRoute } from '@tanstack/react-router'

import { ProjectQcs } from '../../../../../formsAndLists/projectQcsAssignment.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

const from = '/data/projects/$projectId_/qcs-assignment/'

export const Route = createFileRoute('/data/projects/$projectId_/qcs-assignment/')({
  component: () => <ProjectQcs from={from} />,
  notFoundComponent: NotFound,
})
