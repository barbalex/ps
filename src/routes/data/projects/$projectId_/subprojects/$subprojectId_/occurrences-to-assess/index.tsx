import { createFileRoute, useParams } from '@tanstack/react-router'

import { Occurrences } from '../../../../../../../formsAndLists/occurrences.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/occurrences-to-assess/'

export const Route = createFileRoute(from)({
  component: () => {
    const { projectId, subprojectId } = useParams({
      from,
    })
    return (
      <Occurrences
        isToAssess={true}
        projectId={projectId}
        subprojectId={subprojectId}
      />
    )
  },
  notFoundComponent: NotFound,
})
