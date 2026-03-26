import { createFileRoute } from '@tanstack/react-router'
import { ActionWithAll } from '../../../../../../../../../../../formsAndLists/action/WithAll.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/quantities',
)({
  component: () => <ActionWithAll from={from} />,
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
    return {
      navDataFetcher: 'useActionQuantitiesNavData',
    }
  },
})
