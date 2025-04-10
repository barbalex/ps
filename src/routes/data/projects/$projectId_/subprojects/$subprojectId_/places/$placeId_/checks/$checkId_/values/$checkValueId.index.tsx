import { createFileRoute } from '@tanstack/react-router'

import { CheckValue } from '../../../../../../../../../../../formsAndLists/checkValue/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/values/$checkValueId/',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useCheckValueNavData',
  }),
})

function RouteComponent() {
  return (
    <CheckValue from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/values/$checkValueId/" />
  )
}
