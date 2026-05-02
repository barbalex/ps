import { createFileRoute } from '@tanstack/react-router'

import { FieldType } from '../../../formsAndLists/fieldType/index.tsx'

export const Route = createFileRoute('/data/field-types/$fieldTypeId')({
  component: FieldType,
  beforeLoad: ({ params }) => {
    if (!params.fieldTypeId || params.fieldTypeId === 'undefined') {
      throw new Error('Invalid or missing fieldTypeId in route parameters')
    }
    return {
      navDataFetcher: 'useFieldTypeNavData',
    }
  },
})
