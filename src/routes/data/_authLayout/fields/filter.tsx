import { createFileRoute } from '@tanstack/react-router'

import { Filter } from '../../../../components/shared/Filter/index.tsx'
import { FieldForm } from '../../../../formsAndLists/field/Form.tsx'

const from = '/data/_authLayout/fields/filter'

export const Route = createFileRoute(from)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <FieldForm row={row} onChange={onChange} from={from} />
      )}
    </Filter>
  )
}
