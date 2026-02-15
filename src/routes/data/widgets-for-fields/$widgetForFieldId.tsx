import { createFileRoute } from '@tanstack/react-router'

import { WidgetForField } from '../../../formsAndLists/widgetForField/index.tsx'

export const Route = createFileRoute(
  '/data/widgets-for-fields/$widgetForFieldId',
)({
  component: WidgetForField,
  beforeLoad: ({ params }) => {
    if (!params.widgetForFieldId || params.widgetForFieldId === 'undefined') {
      throw new Error('Invalid or missing widgetForFieldId in route parameters')
    }
    return {
      navDataFetcher: 'useWidgetForFieldNavData',
    }
  },
})
