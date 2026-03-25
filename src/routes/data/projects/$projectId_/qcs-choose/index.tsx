import { createFileRoute } from '@tanstack/react-router'

import { ProjectQcs } from '../../../../../formsAndLists/projectQcs.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

const from = '/data/projects/$projectId_/qcs-choose/'

export const Route = createFileRoute(from)({
  component: () => <ProjectQcs from={from} />,
  notFoundComponent: NotFound,
})
