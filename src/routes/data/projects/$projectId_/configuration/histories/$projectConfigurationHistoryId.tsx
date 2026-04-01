import { createFileRoute } from '@tanstack/react-router'

import { ProjectConfigurationHistoryCompare } from '../../../../../../formsAndLists/project/Configuration/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/configuration/histories/$projectConfigurationHistoryId'

export const Route = createFileRoute(from)({
  component: ProjectConfigurationHistoryCompare,
})
