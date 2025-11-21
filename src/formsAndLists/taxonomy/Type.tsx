import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

export const Type = ({ onChange, row }) => {
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT type FROM taxonomy_types order by sort, type`,
  )
  const isLoading = isFirstRender && res === undefined
  const types = res?.rows.map((row) => row.type) ?? []

  return (
    <RadioGroupField
      label="Type"
      name="type"
      list={types}
      isLoading={isLoading}
      value={row.type ?? ''}
      onChange={onChange}
    />
  )
}
