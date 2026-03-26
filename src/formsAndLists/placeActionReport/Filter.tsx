import { Filter } from '../../components/shared/Filter/index.tsx'
import { PlaceActionReportForm } from './Form.tsx'

type Props = {
  from: string
  level?: number
}

export const PlaceActionReportFilter = ({ from, level }: Props) => (
  <Filter from={from} level={level}>
    {({ row, onChange, orIndex }) => (
      <PlaceActionReportForm
        row={row}
        onChange={onChange}
        orIndex={orIndex}
        from={from}
      />
    )}
  </Filter>
)
