import { useIntl } from 'react-intl'
import { Filter } from '../../components/shared/Filter/index.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { chartTypeOptions } from '../../modules/constants.ts'

type Props = {
  from: string
}

export const ChartFilter = ({ from }: Props) => {
  const { formatMessage } = useIntl()
  const list = chartTypeOptions.map((o) => o.value)
  const labelMap = Object.fromEntries(
    chartTypeOptions.map((o) => [
      o.value,
      formatMessage({ id: o.labelId, defaultMessage: o.defaultMessage }),
    ]),
  )

  return (
    <Filter from={from}>
      {({
        row,
        onChange,
      }: {
        row: Record<string, unknown>
        onChange: (e: React.ChangeEvent<HTMLInputElement>, data?: any) => void
      }) => (
        <>
          <TextField
            label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
            name="name"
            value={(row.name ?? '') as string}
            onChange={onChange}
          />
          <RadioGroupField
            label={formatMessage({
              id: 'bCHkLm',
              defaultMessage: 'Diagramm-Typ',
            })}
            name="chart_type"
            list={list}
            labelMap={labelMap}
            value={(row.chart_type ?? '') as string}
            onChange={onChange}
          />
        </>
      )}
    </Filter>
  )
}
