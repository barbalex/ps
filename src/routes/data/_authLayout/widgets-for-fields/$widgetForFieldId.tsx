import { createFileRoute } from '@tanstack/react-router'

import { WidgetForField } from '../../../../formsAndLists/widgetForField/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/widgets-for-fields/$widgetForFieldId',
)({
  component: WidgetForField,
})
