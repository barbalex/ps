import { createFileRoute } from '@tanstack/react-router'

import { Filter } from '../../../../components/shared/Filter/index.tsx'
import { WidgetForFieldForm } from '../../../../formsAndLists/widgetForField/Form.tsx'

const from = '/data/_authLayout/widgets-for-fields/filter'

export const Route = createFileRoute(from)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <WidgetForFieldForm row={row} onChange={onChange} from={from} />
      )}
    </Filter>
  )
}
