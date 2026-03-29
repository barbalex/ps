import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'

import { ActionTaxa } from '../../../../../../../../../../../../../formsAndLists/actionTaxa.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/taxa/'

const TaxaRouteContent = () => {
  const location = useLocation()
  const isTaxaList = /\/taxa\/?$/.test(location.pathname)

  if (isTaxaList) {
    return <ActionTaxa from={from} hideTitle={true} />
  }

  return <Outlet />
}

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/taxa',
)({
  component: TaxaRouteContent,
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
    return {
      navDataFetcher: 'useActionTaxaNavData',
    }
  },
})
