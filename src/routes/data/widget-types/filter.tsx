import { createFileRoute } from '@tanstack/react-router'

import { WidgetTypeFilter } from '../../../formsAndLists/widgetType/Filter.tsx'

const from = '/data/widget-types/filter'

export const Route = createFileRoute(from)({
  component: WidgetTypeFilter,
})
