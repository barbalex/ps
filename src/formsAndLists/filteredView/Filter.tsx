import { Filter } from '../../components/shared/Filter/index.tsx'
import { FilteredViewForm } from './Form.tsx'
import type FilteredViews from '../../models/public/FilteredViews.ts'

type Props = {
  from: string
}

export const FilteredViewFilter = ({ from }: Props) => (
  <Filter from={from}>
    {({ row, onChange }) => (
      <FilteredViewForm
        row={row as unknown as FilteredViews}
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
