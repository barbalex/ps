import { memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

export const LineJoin = memo(({ onChange, row }) => {
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT line_join FROM vector_layer_line_joins order by sort, line_join`,
  )
  const isLoading = isFirstRender && res === undefined
  const list = res?.rows.map((row) => row.line_join) ?? []

  return (
    <RadioGroupField
      label="Linien: Ecken"
      name="line_join"
      list={list}
      isLoading={isLoading}
      value={row.line_join ?? ''}
      onChange={onChange}
    />
  )
})
