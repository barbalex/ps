import { useLiveQuery } from '@electric-sql/pglite-react'

import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

type Props = {
  from: string
}

export const ChartFilter = ({ from }: Props) => {
  const resChartTypes = useLiveQuery(
    `SELECT chart_type FROM chart_types ORDER BY sort, chart_type`,
  )
  const chartTypes = resChartTypes?.rows?.map((row) => row.chart_type) ?? []

  return (
    <Filter from={from}>
      {({ row, onChange }) => (
        <>
          <TextField
            label="Name"
            name="name"
            value={row.name ?? ''}
            onChange={onChange}
          />
          <RadioGroupField
            label="Chart Type"
            name="chart_type"
            list={chartTypes}
            value={row.chart_type ?? ''}
            onChange={onChange}
          />
        </>
      )}
    </Filter>
  )
}
