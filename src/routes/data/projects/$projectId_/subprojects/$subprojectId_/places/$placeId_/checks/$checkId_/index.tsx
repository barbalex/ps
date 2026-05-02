import { createFileRoute } from '@tanstack/react-router'

import { CheckIndex } from '../../../../../../../../../../formsAndLists/check/index.tsx'

export const Route = createFileRoute('/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/')({
  component: () => (
    <CheckIndex
      from="/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/"
      isRootRoute={true}
    />
  ),
})
