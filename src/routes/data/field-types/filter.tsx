import { createFileRoute } from '@tanstack/react-router'

import { FieldTypeFilter } from '../../../formsAndLists/fieldType/Filter.tsx'

const from = '/data/field-types/filter'

export const Route = createFileRoute('/data/field-types/filter')({
  component: () => <FieldTypeFilter from={from} />,
})
