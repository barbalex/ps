import { createFileRoute } from '@tanstack/react-router'

import { PlaceList } from '../../../../../../../../formsAndLists/place/List.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/')({
  component: () => <PlaceList from={from} />,
})
