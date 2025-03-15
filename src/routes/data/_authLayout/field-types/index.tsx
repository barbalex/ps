import { createFileRoute } from '@tanstack/react-router'

import { FieldTypes } from '../../../../formsAndLists/fieldTypes.tsx'
import { NotFound } from '../../../../components/NotFound.tsx'

export const Route = createFileRoute('/data/_authLayout/field-types/')({
  component: FieldTypes,
  notFoundComponent: NotFound,
})
