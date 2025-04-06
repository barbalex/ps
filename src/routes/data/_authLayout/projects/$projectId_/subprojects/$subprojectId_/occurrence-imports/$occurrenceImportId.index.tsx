import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { type } from 'arktype'

import { OccurrenceImport } from '../../../../../../../../formsAndLists/occurrenceImport/index.tsx'

const defaultValues = {
  occurrenceImportTab: 1,
}

const occurrenceImportTabSchema = type({
  occurrenceImportTab: 'number.integer = 1',
})

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/occurrence-imports/$occurrenceImportId/',
)({
  component: OccurrenceImport,
  validateSearch: occurrenceImportTabSchema,
  middlewares: [stripSearchParams(defaultValues)],
  beforeLoad: () => ({
    navDataFetcher: 'useOccurrenceImportNavData',
  }),
})
