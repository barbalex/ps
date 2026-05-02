import { createFileRoute } from '@tanstack/react-router'

import { ProjectQcsRun } from '../../../../../formsAndLists/projectQcsRun.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

const from = '/data/projects/$projectId_/qcs-run/'

export const Route = createFileRoute('/data/projects/$projectId_/qcs-run/')({
  component: () => <ProjectQcsRun from={from} />,
  notFoundComponent: NotFound,
})
