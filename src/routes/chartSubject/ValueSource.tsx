import { memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

export const ValueSource = memo(({ onChange, row }) => {
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT value_source FROM chart_subject_value_sources order by sort, value_source`,
  )
  const isLoading = isFirstRender && res === undefined
  const list = res?.rows.map((row) => row.value_source) ?? []

  return (
    <RadioGroupField
      label="Value Source"
      name="value_source"
      list={list}
      isLoading={isLoading}
      value={row.value_source ?? ''}
      onChange={onChange}
      replaceUnderscoreInLabel={true}
      validationMessage="How to extract the subject's data from the table"
    />
  )
})
