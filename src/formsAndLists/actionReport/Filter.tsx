import { Filter } from '../../components/shared/Filter/index.tsx'
import { ActionReportForm } from './Form.tsx'

type Props = {
  from: string
  level?: number
}

export const ActionReportFilter = ({ from, level }: Props) => (
  <Filter from={from} level={level}>
    {({ row, onChange, orIndex }) => (
      <ActionReportForm
        row={row}
        onChange={onChange}
        orIndex={orIndex}
        from={from}
      />
    )}
  </Filter>
)
