import { createFileRoute } from '@tanstack/react-router'

import { WidgetForFieldFilter } from '../../../formsAndLists/widgetForField/Filter.tsx'

const from = '/data/widgets-for-fields/filter'

export const Route = createFileRoute(from)({
  component: () => <WidgetForFieldFilter from={from} />,
})
