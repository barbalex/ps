import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'

import { RadioGroupField } from '../../../components/shared/RadioGroupField.tsx'

export const PreviousImportOperation = ({ onChange, row }) => {
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT previous_import_operation FROM occurrence_import_previous_operations order by sort, previous_import_operation`,
  )
  const isLoading = isFirstRender && res === undefined
  const previousImportOperation =
    res?.rows.map((row) => row.previous_import_operation) ?? []

  return (
    <RadioGroupField
      label="How to deal with a previous import"
      name="previous_import_operation"
      list={previousImportOperation}
      isLoading={isLoading}
      value={row.previous_import_operation ?? ''}
      onChange={onChange}
    />
  )
}
