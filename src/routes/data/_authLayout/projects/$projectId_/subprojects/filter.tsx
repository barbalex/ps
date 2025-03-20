import { createFileRoute } from '@tanstack/react-router'

import { SubprojectForm } from '../../../../../../formsAndLists/subproject/Form.tsx'
import { Filter } from '../../../../../../components/shared/Filter/index.tsx'

const from = '/data/_authLayout/projects/$projectId_/subprojects/filter'

export const Route = createFileRoute(
  '/data/_authLayout/projects/$projectId_/subprojects/filter',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter from={from}>
      {({ row, onChange, orIndex }) => (
        <SubprojectForm
          row={row}
          onChange={onChange}
          orIndex={orIndex}
          from={from}
        />
      )}
    </Filter>
  )
}
