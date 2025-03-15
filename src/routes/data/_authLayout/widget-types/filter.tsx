import { createFileRoute } from '@tanstack/react-router'

import { Filter } from '../../../../components/shared/Filter/index.tsx'
import { WidgetTypeForm } from '../../../../formsAndLists/widgetType/Form.tsx'

const from = '/data/_authLayout/widget-types/filter'

export const Route = createFileRoute(from)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <WidgetTypeForm row={row} onChange={onChange} from={from} />
      )}
    </Filter>
  )
}
