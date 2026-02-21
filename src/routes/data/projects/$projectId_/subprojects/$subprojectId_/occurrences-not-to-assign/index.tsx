import { createFileRoute, useParams } from '@tanstack/react-router'

import { Occurrences } from '../../../../../../../formsAndLists/occurrences.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/occurrences-not-to-assign/'

export const Route = createFileRoute(from)({
  component: () => {
    const { projectId, subprojectId } = useParams({
      from,
    })
    return (
      <Occurrences
        isNotToAssign={true}
        projectId={projectId}
        subprojectId={subprojectId}
      />
    )
  },
  notFoundComponent: NotFound,
})
