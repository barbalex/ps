import { createFileRoute } from '@tanstack/react-router'

import { ActionValues } from '../../../../../../../../../../../formsAndLists/actionValues.tsx'
import { NotFound } from '../../../../../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/values/'

export const Route = createFileRoute(from)({
  component: () => (
    <ActionValues from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/values/" />
  ),
  notFoundComponent: NotFound,
})
