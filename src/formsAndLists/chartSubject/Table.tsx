import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

export const Table = ({ onChange, row, ref, validations }) => {
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT table_name FROM chart_subject_table_names order by sort, table_name`,
  )
  const isLoading = isFirstRender && res === undefined
  const list = res?.rows.map((row) => row.table_name) ?? []

  return (
    <RadioGroupField
      label="Table"
      name="table_name"
      list={list}
      isLoading={isLoading}
      value={row.table_name ?? ''}
      onChange={onChange}
      autoFocus
      ref={ref}
      validationState={validations?.table_name?.state}
      validationMessage={
        validations.table_name?.message ??
        'Choose what table to get the data from'
      }
    />
  )
}
