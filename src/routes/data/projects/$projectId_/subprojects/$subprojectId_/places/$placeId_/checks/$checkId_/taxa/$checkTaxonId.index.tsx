import { createFileRoute } from '@tanstack/react-router'

import { CheckTaxon } from '../../../../../../../../../../../formsAndLists/checkTaxon/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/taxa/$checkTaxonId/'

export const Route = createFileRoute(from)({
  component: () => (
    <CheckTaxon from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/taxa/$checkTaxonId/" />
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
    if (!params.checkTaxonId || params.checkTaxonId === 'undefined') {
      throw new Error('Invalid or missing checkTaxonId in route parameters')
    }
    return {
      navDataFetcher: 'useCheckTaxonNavData',
    }
  },
})
