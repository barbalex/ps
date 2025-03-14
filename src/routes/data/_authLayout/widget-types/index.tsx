import { createFileRoute } from '@tanstack/react-router'

import { WidgetTypes } from '../../../../formsAndLists/widgetTypes.tsx'

export const Route = createFileRoute('/data/_authLayout/widget-types/')({
  component: WidgetTypes,
})
