import { createFileRoute } from '@tanstack/react-router'

import { SubprojectIndex } from '../../../../../../formsAndLists/subproject/Index.tsx'
const from = '/data/projects/$projectId_/subprojects/$subprojectId_/subproject'

export const Route = createFileRoute(from)({
  component: () => (
    <SubprojectIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/subproject" />
  ),
})
