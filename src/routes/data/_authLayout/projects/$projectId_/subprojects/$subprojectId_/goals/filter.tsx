import { createFileRoute } from '@tanstack/react-router'

import { GoalForm } from '../../../../../../../../formsAndLists/goal/Form.tsx'
import { Filter } from '../../../../../../../../components/shared/Filter/index.tsx'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/filter'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/filter',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter from={from}>
      {({ row, onChange, orIndex }) => (
        <GoalForm
          row={row}
          onChange={onChange}
          orIndex={orIndex}
          from={from}
        />
      )}
    </Filter>
  )
}
