import { createFileRoute } from '@tanstack/react-router'

import { CheckForm } from '../../../../../../../../../../../formsAndLists/check/Form.tsx'
import { Filter } from '../../../../../../../../../../../../../components/shared/Filter/index.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/filter',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter
      level={1}
      from={from}
    >
      {({ row, onChange, orIndex }) => (
        <CheckForm
          row={row}
          onChange={onChange}
          orIndex={orIndex}
          from={from}
        />
      )}
    </Filter>
  )
}
