import { createFileRoute } from '@tanstack/react-router'

import { WidgetType } from '../../../../formsAndLists/widgetType/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/widget-types/$widgetTypeId',
)({
  component: WidgetType,
})
