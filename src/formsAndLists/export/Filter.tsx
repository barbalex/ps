import { Filter } from '../../components/shared/Filter/index.tsx'
import { ExportForm } from './Form.tsx'
import type Exports from '../../models/public/Exports.ts'

type Props = {
  from: string
}

export const ExportFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <ExportForm
        row={row as unknown as Exports}
        onChange={onChange}
        from={from}
      />
    )}
  </Filter>
)
