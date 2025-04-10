import { createFileRoute } from '@tanstack/react-router'

import { ActionForm } from '../../../../../../../../../../../formsAndLists/action/Form.tsx'
import { Filter } from '../../../../../../../../../../../components/shared/Filter/index.tsx'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/filter',
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
        <ActionForm
          row={row}
          onChange={onChange}
          orIndex={orIndex}
          from={from}
        />
      )}
    </Filter>
  )
}
