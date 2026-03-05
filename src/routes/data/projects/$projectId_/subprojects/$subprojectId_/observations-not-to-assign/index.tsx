import { createFileRoute, useParams } from '@tanstack/react-router'

import { Observations } from '../../../../../../../formsAndLists/observations.tsx'
import { NotFound } from '../../../../../../../components/NotFound.tsx'
const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/observations-not-to-assign/'

export const Route = createFileRoute(from)({
  component: () => {
    const { projectId, subprojectId } = useParams({
      from,
    })
    return (
      <Observations
        isNotToAssign={true}
        projectId={projectId}
        subprojectId={subprojectId}
      />
    )
  },
  notFoundComponent: NotFound,
})
