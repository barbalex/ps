import { createFileRoute } from '@tanstack/react-router'

import { Occurrence } from '../../../../../../../../../../../formsAndLists/occurrence/index.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/occurrences/$occurrenceId/'

export const Route = createFileRoute(from)({
  component: () => (
    <Occurrence from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/occurrences/$occurrenceId/" />
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
    if (!params.placeId2 || params.placeId2 === 'undefined') {
      throw new Error('Invalid or missing placeId2 in route parameters')
    }
    if (!params.occurrenceId || params.occurrenceId === 'undefined') {
      throw new Error('Invalid or missing occurrenceId in route parameters')
    }
    return {
      navDataFetcher: 'useOccurrenceAssignedNavData',
    }
  },
})
