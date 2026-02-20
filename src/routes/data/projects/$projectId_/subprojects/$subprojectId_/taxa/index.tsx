import { createFileRoute } from '@tanstack/react-router'

import { SubprojectTaxa } from '../../../../../../../formsAndLists/subprojectTaxa.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

const from = '/data/projects/$projectId_/subprojects/$subprojectId_/taxa/'

export const Route = createFileRoute(from)({
  component: () => <SubprojectTaxa from={from} />,
  notFoundComponent: NotFound,
})
