import { createFileRoute } from '@tanstack/react-router'

import { PlaceTableView } from '../../../../../../../../../formsAndLists/place/TableView.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/table-views/$tableViewId/',
)({
  component: PlaceTableView,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.placeId || params.placeId === 'undefined') {
      throw new Error('Invalid or missing placeId in route parameters')
    }
    if (!params.tableViewId || params.tableViewId === 'undefined') {
      throw new Error(
        'Invalid or missing tableViewId in route parameters',
      )
    }
    return {
      navDataFetcher: 'usePlaceTableViewNavData',
    }
  },
})
