import { createFileRoute } from '@tanstack/react-router'

import { ActionValue } from '../../../../../../../../../../../../../../formsAndLists/actionValue/index.tsx'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/values/$actionValueId/',
)({
  component: RouteComponent,
  beforeLoad: () => ({
    navDataFetcher: 'useActionValueNavData',
  }),
})

function RouteComponent() {
  return (
    <ActionValue from="/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/values/$actionValueId/" />
  )
}
