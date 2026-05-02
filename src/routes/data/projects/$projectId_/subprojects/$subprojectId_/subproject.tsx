import { createFileRoute } from '@tanstack/react-router'

import { SubprojectIndex } from '../../../../../../formsAndLists/subproject/index.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/subproject')({
  component: () => (
    <SubprojectIndex from="/data/projects/$projectId_/subprojects/$subprojectId_/subproject" />
  ),
})
