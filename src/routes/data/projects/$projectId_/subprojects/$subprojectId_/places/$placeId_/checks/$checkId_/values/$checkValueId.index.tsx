import { createFileRoute } from '@tanstack/react-router'

import { CheckValue } from '../../../../../../../../../../../formsAndLists/checkValue/index.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/values/$checkValueId/',
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.projectId_ || params.projectId_ === 'undefined') {
      throw new Error('Invalid or missing projectId_ in route parameters')
    }
    if (!params.subprojectId_ || params.subprojectId_ === 'undefined') {
      throw new Error('Invalid or missing subprojectId_ in route parameters')
    }
    if (!params.placeId_ || params.placeId_ === 'undefined') {
      throw new Error('Invalid or missing placeId_ in route parameters')
    }
    if (!params.checkId_ || params.checkId_ === 'undefined') {
      throw new Error('Invalid or missing checkId_ in route parameters')
    }
    if (!params.checkValueId || params.checkValueId === 'undefined') {
      throw new Error('Invalid or missing checkValueId in route parameters')
    }
    return {
    navDataFetcher: 'useCheckValueNavData',
  }
  },
})

function RouteComponent() {
  return (
    <CheckValue from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/values/$checkValueId/" />
  )
}
