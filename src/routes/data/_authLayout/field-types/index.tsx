import { createFileRoute } from '@tanstack/react-router'

import { FieldTypes } from '../../../../formsAndLists/fieldTypes.tsx'

export const Route = createFileRoute('/data/_authLayout/field-types/')({
  component: FieldTypes,
})
