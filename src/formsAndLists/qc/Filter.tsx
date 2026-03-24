import { Filter } from '../../components/shared/Filter/index.tsx'
import { QcForm } from './Form.tsx'

type Props = {
  from: string
}

export const QcFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <QcForm row={row} onChange={onChange} from={from} />
    )}
  </Filter>
)
