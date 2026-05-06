import { createFileRoute } from '@tanstack/react-router'

import { ProjectQcsAssignment } from '../../../../../formsAndLists/projectQcsAssignment.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

const from = '/data/projects/$projectId_/qcs-assignment/'

export const Route = createFileRoute('/data/projects/$projectId_/qcs-assignment/')({
  component: () => <ProjectQcsAssignment from={from} />,
  notFoundComponent: NotFound,
})
