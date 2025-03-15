import { createFileRoute } from '@tanstack/react-router'

import { Filter } from '../../../../components/shared/Filter/index.tsx'
import { FieldTypeForm } from '../../../../formsAndLists/fieldType/Form.tsx'

const from = '/data/_authLayout/field-types/filter'

export const Route = createFileRoute(from)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <FieldTypeForm row={row} onChange={onChange} from={from} />
      )}
    </Filter>
  )
}
