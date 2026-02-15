import { createFileRoute } from '@tanstack/react-router'

import { ActionValue } from '../../../../../../../../../../../../../formsAndLists/actionValue/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/values/$actionValueId/',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId || params.projectId === 'undefined') {
      throw new Error('Invalid or missing projectId in route parameters')
    }
    if (!params.subprojectId || params.subprojectId === 'undefined') {
      throw new Error('Invalid or missing subprojectId in route parameters')
    }
    if (!params.placeId || params.placeId === 'undefined') {
      throw new Error('Invalid or missing placeId in route parameters')
    }
    if (!params.placeId2 || params.placeId2 === 'undefined') {
      throw new Error('Invalid or missing placeId2 in route parameters')
    }
    if (!params.actionId || params.actionId === 'undefined') {
      throw new Error('Invalid or missing actionId in route parameters')
    }
    if (!params.actionValueId || params.actionValueId === 'undefined') {
      throw new Error('Invalid or missing actionValueId in route parameters')
    }
    return {
    navDataFetcher: 'useActionValueNavData',
  }
  },
})

function RouteComponent() {
  return (
    <ActionValue from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/values/$actionValueId/" />
  )
}
