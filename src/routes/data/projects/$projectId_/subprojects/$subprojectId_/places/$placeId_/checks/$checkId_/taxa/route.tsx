import { createFileRoute } from '@tanstack/react-router'

import { CheckWithAll } from '../../../../../../../../../../../formsAndLists/check/WithAll.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/check'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/taxa',
)({
  component: () => <CheckWithAll from={from} />,
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
    return {
      navDataFetcher: 'useCheckTaxaNavData',
    }
  },
})
