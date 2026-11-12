import { createFileRoute } from '@tanstack/react-router'

import { FieldGroups } from '../../../../../../formsAndLists/fieldGroups.tsx'
import { NotFound } from '../../../../../../components/NotFound.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/field-groups/$tableName/',
)({
  component: FieldGroups,
  notFoundComponent: NotFound,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.tableName || params.tableName === 'undefined') {
      throw new Error('Invalid or missing tableName in route parameters')
    }
    return {
      navDataFetcher: 'useFieldGroupsNavData',
    }
  },
})
