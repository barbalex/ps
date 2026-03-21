import { createFileRoute } from '@tanstack/react-router'

import { CheckQuantity } from '../../../../../../../../../../../formsAndLists/checkQuantity/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/quantities/$checkQuantityId/'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckQuantity from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/quantities/$checkQuantityId/" />
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
    if (!params.checkId || params.checkId === 'undefined') {
      throw new Error('Invalid or missing checkId in route parameters')
    }
    if (!params.checkQuantityId || params.checkQuantityId === 'undefined') {
      throw new Error('Invalid or missing checkQuantityId in route parameters')
    }
    return {
      navDataFetcher: 'useCheckQuantityNavData',
    }
  },
})
