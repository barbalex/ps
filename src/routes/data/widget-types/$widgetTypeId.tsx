import { createFileRoute } from '@tanstack/react-router'

import { WidgetType } from '../../../formsAndLists/widgetType/index.tsx'

export const Route = createFileRoute(
  '/data/widget-types/$widgetTypeId',
)({
  component: WidgetType,
  beforeLoad: () => ({
    navDataFetcher: 'useWidgetTypeNavData',
  }),
})
