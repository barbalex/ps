import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { chartTypeOptions } from '../../modules/constants.ts'

type Props = {
  from: string
}

export const ChartFilter = ({ from }: Props) => {
  const list = chartTypeOptions.map((o) => o.value)

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
            list={list}
            value={row.chart_type ?? ''}
            onChange={onChange}
          />
        </>
      )}
    </Filter>
  )
}
