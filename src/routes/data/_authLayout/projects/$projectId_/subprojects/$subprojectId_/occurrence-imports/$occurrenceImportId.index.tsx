import { createFileRoute } from '@tanstack/react-router'
import { type } from 'arktype'

import { OccurrenceImport } from '../../../../../../../../formsAndLists/occurrenceImport/index.tsx'

  const occurrenceImportTabSchema = type({
    occurrenceImportTab: 'number = 1',
  })

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/occurrence-imports/$occurrenceImportId/',
)({
  component: OccurrenceImport,
  validateSearch: occurrenceImportTabSchema,
})
