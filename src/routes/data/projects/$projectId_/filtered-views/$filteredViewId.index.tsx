import { createFileRoute } from '@tanstack/react-router'

import { FilteredView } from '../../../../../formsAndLists/filteredView/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/filtered-views/$filteredViewId/',
)({
  component: FilteredView,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.filteredViewId || params.filteredViewId === 'undefined') {
      throw new Error(
        'Invalid or missing filteredViewId in route parameters',
      )
    }
    return {
      navDataFetcher: 'useFilteredViewNavData',
    }
  },
})
