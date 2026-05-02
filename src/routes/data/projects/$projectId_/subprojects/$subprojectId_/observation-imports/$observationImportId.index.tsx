import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { type } from 'arktype'

import { ObservationImport } from '../../../../../../../formsAndLists/observationImport/index.tsx'

const defaultValues = {
  observationImportTab: 1,
}

const observationImportTabSchema = type({
  observationImportTab: 'number.integer = 1',
})

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/observation-imports/$observationImportId/',
)({
  component: ObservationImport,
  validateSearch: observationImportTabSchema,
  middlewares: [stripSearchParams(defaultValues)],
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (
      !params.observationImportId ||
      params.observationImportId === 'undefined'
    ) {
      throw new Error(
        'Invalid or missing observationImportId in route parameters',
      )
    }
    return {
      navDataFetcher: 'useObservationImportNavData',
    }
  },
})
