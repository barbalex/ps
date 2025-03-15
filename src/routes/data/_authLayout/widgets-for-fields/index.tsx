import { createFileRoute } from '@tanstack/react-router'

import { WidgetsForFields } from '../../../../formsAndLists/widgetsForFields.tsx'
import { NotFound } from '../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/_authLayout/widgets-for-fields/')({
  component: WidgetsForFields,
  notFoundComponent: NotFound,
})
