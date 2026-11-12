import { createFileRoute } from '@tanstack/react-router'

import { FieldGroup } from '../../../../../../formsAndLists/fieldGroup/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/field-groups/$tableName/$fieldGroupId/',
)({
  component: FieldGroup,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.fieldGroupId || params.fieldGroupId === 'undefined') {
      throw new Error(
        'Invalid or missing fieldGroupId in route parameters',
      )
    }
    return {
      navDataFetcher: 'useFieldGroupNavData',
    }
  },
})
