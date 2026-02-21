import { createFileRoute } from '@tanstack/react-router'

import { Subproject } from '../../../../../../formsAndLists/subproject/index.tsx'
const from = '/data/projects/$projectId_/subprojects/$subprojectId_/subproject'

export const Route = createFileRoute(from)({
  component: () => (
    <Subproject from="/data/projects/$projectId_/subprojects/$subprojectId_/subproject" />
  ),
})
