import { createFileRoute } from '@tanstack/react-router'

import { SubprojectQcs } from '../../../../../../../formsAndLists/subprojectQcs.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'

const from = '/data/projects/$projectId_/subprojects/$subprojectId_/qcs-choose/'

export const Route = createFileRoute(from)({
  component: () => <SubprojectQcs from={from} />,
  notFoundComponent: NotFound,
})
