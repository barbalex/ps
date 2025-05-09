import { createFileRoute } from '@tanstack/react-router'

import { WidgetTypes } from '../../../formsAndLists/widgetTypes.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/widget-types/')({
  component: WidgetTypes,
  notFoundComponent: NotFound,
})
