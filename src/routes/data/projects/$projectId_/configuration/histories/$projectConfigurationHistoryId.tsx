import { createFileRoute } from '@tanstack/react-router'

import { ProjectConfigurationHistoryCompare } from '../../../../../../formsAndLists/project/Configuration/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/configuration/histories/$projectConfigurationHistoryId')({
  component: ProjectConfigurationHistoryCompare,
})
