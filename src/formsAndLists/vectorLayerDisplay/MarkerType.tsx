import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

export const MarkerType = ({ onChange, row }) => {
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT marker_type FROM vector_layer_marker_types order by sort, marker_type`,
  )
  const isLoading = isFirstRender && res === undefined
  const list = res?.rows.map((row) => row.marker_type) ?? []

  return (
    <RadioGroupField
      label="Punkt-Typ"
      name="marker_type"
      list={list}
      isLoading={isLoading}
      value={row.marker_type ?? ''}
      onChange={onChange}
    />
  )
}
