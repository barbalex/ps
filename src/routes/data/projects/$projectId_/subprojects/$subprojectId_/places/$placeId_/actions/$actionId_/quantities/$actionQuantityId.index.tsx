import { createFileRoute } from '@tanstack/react-router'

import { ActionQuantity } from '../../../../../../../../../../../formsAndLists/actionQuantity/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/quantities/$actionQuantityId/'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionQuantity from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/quantities/$actionQuantityId/" />
  ),
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
    if (!params.actionId || params.actionId === 'undefined') {
      throw new Error('Invalid or missing actionId in route parameters')
    }
    if (!params.actionQuantityId || params.actionQuantityId === 'undefined') {
      throw new Error('Invalid or missing actionQuantityId in route parameters')
    }
    return {
      navDataFetcher: 'useActionQuantityNavData',
    }
  },
})
