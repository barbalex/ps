import { createFileRoute } from '@tanstack/react-router'

import { SubprojectList } from '../../../../../../formsAndLists/subproject/List.tsx'
const from = '/data/projects/$projectId_/subprojects/$subprojectId_/'

export const Route = createFileRoute(from)({
  component: () => (
    <SubprojectList from="/data/projects/$projectId_/subprojects/$subprojectId_/" />
  ),
})
