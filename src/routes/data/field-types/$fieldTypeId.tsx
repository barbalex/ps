import { createFileRoute } from '@tanstack/react-router'

import { FieldType } from '../../../formsAndLists/fieldType/index.tsx'

export const Route = createFileRoute(
  '/data/field-types/$fieldTypeId',
)({
  component: FieldType,
  beforeLoad: () => ({
    navDataFetcher: 'useFieldTypeNavData',
  }),
})
