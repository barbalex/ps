import { Filter } from '../../components/shared/Filter/index.tsx'
import { WidgetForFieldForm } from './Form.tsx'

const from = '/data/widgets-for-fields/filter'

export const WidgetForFieldFilter = () => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <WidgetForFieldForm row={row} onChange={onChange} from={from} />
    )}
  </Filter>
)
