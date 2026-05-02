import { createFileRoute } from '@tanstack/react-router'

import { WidgetTypeFilter } from '../../../formsAndLists/widgetType/Filter.tsx'

const from = '/data/widget-types/filter'

export const Route = createFileRoute('/data/widget-types/filter')({
  component: () => <WidgetTypeFilter from={from} />,
})
