import { createFileRoute } from '@tanstack/react-router'

import { Filter } from '../../../../../components/shared/Filter/index.tsx'
import { FieldForm } from '../../../../../formsAndLists/field/Form.tsx'

export const Route = createFileRoute(
  '/data/projects/$projectId_/fields/filter',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter from="/data/projects/$projectId_/fields/filter">
      {({ row, onChange }) => (
        <FieldForm
          row={row}
          onChange={onChange}
          from="/data/projects/$projectId_/fields/filter"
          
        />
      )}
    </Filter>
  )
}
