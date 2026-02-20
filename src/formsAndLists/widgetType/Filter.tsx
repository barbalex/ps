import { Filter } from '../../components/shared/Filter/index.tsx'
import { WidgetTypeForm } from './Form.tsx'

const from = '/data/widget-types/filter'

export const WidgetTypeFilter = () => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <WidgetTypeForm row={row} onChange={onChange} from={from} />
    )}
  </Filter>
)