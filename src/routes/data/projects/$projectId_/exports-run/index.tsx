import { createFileRoute } from '@tanstack/react-router'

import { ProjectExportsRun } from '../../../../../formsAndLists/projectExportsRun.tsx'
import { NotFound } from '../../../../../components/NotFound.tsx'

const from = '/data/projects/$projectId_/exports-run/'

export const Route = createFileRoute('/data/projects/$projectId_/exports-run/')({
  component: () => <ProjectExportsRun from={from} />,
  notFoundComponent: NotFound,
})
