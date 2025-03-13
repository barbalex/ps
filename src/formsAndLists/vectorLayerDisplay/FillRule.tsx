import { memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

export const FillRule = memo(({ onChange, row }) => {
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT fill_rule FROM vector_layer_fill_rules order by sort, fill_rule`,
  )
  const isLoading = isFirstRender && res === undefined
  const list = res?.rows.map((row) => row.fill_rule) ?? []

  return (
    <RadioGroupField
      label="Füllung: Regel, um den Inhalt von Flächen zu bestimmen"
      name="fill_rule"
      list={list}
      isLoading={isLoading}
      value={row.fill_rule ?? ''}
      onChange={onChange}
    />
  )
})
