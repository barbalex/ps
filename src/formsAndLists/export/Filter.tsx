import { Filter } from '../../components/shared/Filter/index.tsx'
import { ExportForm } from './Form.tsx'

type Props = {
  from: string
}

export const ExportFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <ExportForm row={row} onChange={onChange} from={from} />
    )}
  </Filter>
)
