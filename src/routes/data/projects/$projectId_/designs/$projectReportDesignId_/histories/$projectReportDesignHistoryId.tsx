import { createFileRoute } from '@tanstack/react-router'

import { ProjectReportDesignHistoryCompare } from '../../../../../../../formsAndLists/projectReportDesign/HistoryCompare.tsx'


export const Route = createFileRoute('/data/projects/$projectId_/designs/$projectReportDesignId_/histories/$projectReportDesignHistoryId')({
  component: ProjectReportDesignHistoryCompare,
})
