import { memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

export const ChartType = memo(({ onChange, row, ref }) => {
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT chart_type FROM chart_types order by sort, chart_type`,
  )
  const isLoading = isFirstRender && res === undefined
  const list = res?.rows.map((row) => row.chart_type) ?? []

  return (
    <RadioGroupField
      label="Chart Type"
      name="chart_type"
      list={list}
      isLoading={isLoading}
      value={row.chart_type ?? ''}
      onChange={onChange}
      autoFocus
      validationMessage="Choose what type of chart you want to display"
      ref={ref}
    />
  )
})
