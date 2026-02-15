import { createFileRoute } from '@tanstack/react-router'

import { WidgetType } from '../../../formsAndLists/widgetType/index.tsx'

export const Route = createFileRoute(
  '/data/widget-types/$widgetTypeId',
)({
  component: WidgetType,
  beforeLoad: ({ params }) => {
    if (!params.widgetTypeId || params.widgetTypeId === 'undefined') {
      throw new Error('Invalid or missing widgetTypeId in route parameters')
    }
    return {
      navDataFetcher: 'useWidgetTypeNavData',
    }
  },
})
