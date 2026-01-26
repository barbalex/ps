import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

export const Level = ({ onChange, row, validations }) => {
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT level FROM chart_subject_table_levels order by level`,
  )
  const isLoading = isFirstRender && res === undefined
  const list = res?.rows.map((row) => row.level) ?? []

  return (
    <RadioGroupField
      label="Level"
      name="table_level"
      list={list}
      isLoading={isLoading}
      value={row.table_level ?? ''}
      onChange={onChange}
      validationState={validations?.table_level?.state}
      validationMessage={
        validations.table_level?.message ??
        'Level of places and their respective checks and actions'
      }
    />
  )
}
