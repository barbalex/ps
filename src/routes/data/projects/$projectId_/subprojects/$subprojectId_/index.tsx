import { createFileRoute } from '@tanstack/react-router'

import { SubprojectList } from '../../../../../../formsAndLists/subproject/List.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/')({
  component: () => (
    <SubprojectList from="/data/projects/$projectId_/subprojects/$subprojectId_/" />
  ),
})
