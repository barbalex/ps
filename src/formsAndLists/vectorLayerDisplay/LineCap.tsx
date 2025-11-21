import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

export const LineCap = ({ onChange, row }) => {
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT line_cap FROM vector_layer_line_caps order by sort, line_cap`,
  )
  const isLoading = isFirstRender && res === undefined
  const list = res?.rows.map((row) => row.line_cap) ?? []

  return (
    <RadioGroupField
      label="Linien: Abschluss"
      name="line_cap"
      list={list}
      isLoading={isLoading}
      value={row.line_cap ?? ''}
      onChange={onChange}
    />
  )
}
