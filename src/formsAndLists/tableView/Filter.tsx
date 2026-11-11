import { Filter } from '../../components/shared/Filter/index.tsx'
import { TableViewForm } from './Form.tsx'
import type TableViews from '../../models/public/TableViews.ts'

type Props = {
  from: string
}

export const TableViewFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <TableViewForm
        row={row as unknown as TableViews}
        onChange={
          onChange as unknown as (
            e: React.ChangeEvent<HTMLElement>,
            data?: unknown,
          ) => void
        }
      />
    )}
  </Filter>
)
