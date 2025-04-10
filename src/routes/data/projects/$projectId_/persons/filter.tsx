import { createFileRoute } from '@tanstack/react-router'

import { PersonForm } from '../../../../../formsAndLists/person/Form.tsx'
import { Filter } from '../../../../../components/shared/Filter/index.tsx'

const from = '/data/projects/$projectId_/persons/filter'

export const Route = createFileRoute(
  '/data/projects/$projectId_/persons/filter',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter from={from}>
      {({ row, onChange, orIndex }) => (
        <PersonForm
          row={row}
          onChange={onChange}
          orIndex={orIndex}
          from={from}
        />
      )}
    </Filter>
  )
}
