import { createFileRoute } from '@tanstack/react-router'

import { ProjectReportDesignHistoryCompare } from '../../../../../../../formsAndLists/projectReportDesign/HistoryCompare.tsx'

const from =
  '/data/projects/$projectId_/designs/$projectReportDesignId_/histories/$projectReportDesignHistoryId'

export const Route = createFileRoute(from)({
  component: ProjectReportDesignHistoryCompare,
})
