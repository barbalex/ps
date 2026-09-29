import { useParams } from '@tanstack/react-router'

import { Filter } from '../../components/shared/Filter/index.tsx'
import { CheckForm } from '../check/Form.tsx'
import { getFilteredViewFilterAtom } from '../../store.ts'
import type Checks from '../../models/public/Checks.ts'

type Props = {
  from: string
  level: number
}

/**
 * Filter page of a filtered view's checks list. Filters the checks of this
 * view on top of the view's own static filter.
 */
export const FilteredCheckFilter = ({ from, level }: Props) => {
  const { filteredViewId } = useParams({ from: from as never })

  return (
    <Filter
      from={from}
      level={level}
      tableNameOverride="checks"
      filterAtomOverride={getFilteredViewFilterAtom(filteredViewId!)}
    >
      {({ row, onChange, orIndex }) => (
        <CheckForm
          row={row as unknown as Checks}
          onChange={onChange}
          orIndex={orIndex}
          from={from}
        />
      )}
    </Filter>
  )
}
