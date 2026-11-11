import { useParams } from '@tanstack/react-router'

import { Filter } from '../../components/shared/Filter/index.tsx'
import { ActionForm } from '../action/Form.tsx'
import { getTableViewFilterAtom } from '../../store.ts'
import type Actions from '../../models/public/Actions.ts'

type Props = {
  from: string
  level: number
}

/**
 * Filter page of a table view's actions list. Filters the actions of this
 * view on top of the view's own static filter.
 */
export const TableActionFilter = ({ from, level }: Props) => {
  const { tableViewId } = useParams({ from: from as never })

  return (
    <Filter
      from={from}
      level={level}
      tableNameOverride="actions"
      filterAtomOverride={getTableViewFilterAtom(tableViewId!)}
    >
      {({ row, onChange, orIndex }) => (
        <ActionForm
          row={row as unknown as Actions}
          onChange={onChange}
          orIndex={orIndex}
          from={from}
        />
      )}
    </Filter>
  )
}
