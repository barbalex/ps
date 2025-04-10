import { createFileRoute } from '@tanstack/react-router'

import { WidgetForField } from '../../../formsAndLists/widgetForField/index.tsx'

export const Route = createFileRoute(
  '/data/widgets-for-fields/$widgetForFieldId',
)({
  component: WidgetForField,
  beforeLoad: () => ({
    navDataFetcher: 'useWidgetForFieldNavData',
  }),
})
