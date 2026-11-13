import { createFileRoute } from '@tanstack/react-router'
import { ObservationImport } from '../../../../../../../formsAndLists/observationImport/index.tsx'

// plain validator instead of an arktype schema: this route's search segment
// is part of the eager entry chunk, and arktype + @ark/schema (~30 KB gz)
// came along with it. The param is only ever set programmatically (as a
// proper number), so permissive coercion is safe.
type ObservationImportSearch = { observationImportTab?: number }
const observationImportTabValidator = (
  search: Record<string, unknown>,
): ObservationImportSearch => ({
  observationImportTab:
    (
      typeof search.observationImportTab === 'number' &&
      Number.isInteger(search.observationImportTab)
    ) ?
      search.observationImportTab
    : 1,
})

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/observation-imports/$observationImportId/',
)({
  component: ObservationImport,
  validateSearch: observationImportTabValidator,
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
