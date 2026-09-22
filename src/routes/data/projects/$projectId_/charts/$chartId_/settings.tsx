import { createFileRoute } from '@tanstack/react-router'

import { ChartSettings } from '../../../../../../formsAndLists/chart/Settings.tsx'
import { NotFound } from '../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/charts/$chartId_/settings',
)({
  component: () => (
    <ChartSettings from="/data/projects/$projectId_/charts/$chartId_/settings" />
  ),
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.chartId || params.chartId === 'undefined') {
      throw new Error('Invalid or missing chartId in route parameters')
    }
    return {
      navDataFetcher: 'useChartSettingsNavData',
    }
  },
})
