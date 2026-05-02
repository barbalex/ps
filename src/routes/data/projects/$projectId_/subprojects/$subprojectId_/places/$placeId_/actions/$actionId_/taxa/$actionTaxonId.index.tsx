import { createFileRoute } from '@tanstack/react-router'

import { ActionTaxon } from '../../../../../../../../../../../formsAndLists/actionTaxon'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/taxa/$actionTaxonId/')({
  component: () => (
    <ActionTaxon from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/taxa/$actionTaxonId/" />
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
    if (!params.actionTaxonId || params.actionTaxonId === 'undefined') {
      throw new Error('Invalid or missing actionTaxonId in route parameters')
    }
    return {
      navDataFetcher: 'useActionTaxonNavData',
    }
  },
})
