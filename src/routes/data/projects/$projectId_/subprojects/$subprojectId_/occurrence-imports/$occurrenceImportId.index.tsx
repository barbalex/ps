import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { type } from 'arktype'

import { OccurrenceImport } from '../../../../../../../formsAndLists/occurrenceImport/index.tsx'

const defaultValues = {
  occurrenceImportTab: 1,
}

const occurrenceImportTabSchema = type({
  occurrenceImportTab: 'number.integer = 1',
})

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/occurrence-imports/$occurrenceImportId/',
)({
  component: OccurrenceImport,
  validateSearch: occurrenceImportTabSchema,
  middlewares: [stripSearchParams(defaultValues)],
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.occurrenceImportId || params.occurrenceImportId === 'undefined') {
      throw new Error('Invalid or missing occurrenceImportId in route parameters')
    }
    return {
    navDataFetcher: 'useOccurrenceImportNavData',
  }
  },
})
