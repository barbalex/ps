import { createFileRoute } from '@tanstack/react-router'

import { ProjectExportFilter } from '../../../../../formsAndLists/projectExport/Filter.tsx'

const from = '/data/projects/$projectId_/exports/filter'

export const Route = createFileRoute('/data/projects/$projectId_/exports/filter')({
  component: () => <ProjectExportFilter from={from} />,
})
