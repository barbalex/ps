import { useIntl } from 'react-intl'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { chartTypeOptions } from '../../modules/constants.ts'
import type Charts from '../../models/public/Charts.ts'

type ValidationEntry = {
  state?: 'error' | 'warning' | 'success' | 'none'
  message?: string
}

type Props = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>, data?: object) => void
  validations: Record<string, ValidationEntry>
  row: Charts
  ref?: React.Ref<HTMLInputElement>
}

export const ChartType = ({ onChange, validations, row, ref }: Props) => {
  const { formatMessage } = useIntl()

  const list = chartTypeOptions.map((o) => o.value)
  const labelMap = Object.fromEntries(
    chartTypeOptions.map((o) => [
      o.value,
      formatMessage({ id: o.labelId, defaultMessage: o.defaultMessage }),
    ]),
  )

  return (
    <RadioGroupField
      label={formatMessage({ id: 'bCHkLm', defaultMessage: 'Diagramm-Typ' })}
      name="chart_type"
      list={list}
      labelMap={labelMap}
      value={row.chart_type ?? ''}
      onChange={onChange}
      autoFocus
      validationState={validations?.chart_type?.state}
      validationMessage={
        validations.chart_type?.message ??
        formatMessage({
          id: 'bCIlMn',
          defaultMessage: 'Wähle den anzuzeigenden Diagramm-Typ',
        })
      }
      ref={ref}
    />
  )
}
