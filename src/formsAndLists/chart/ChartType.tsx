import { useIntl } from 'react-intl'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { chartTypeOptions } from '../../modules/constants.ts'

export const ChartType = ({ onChange, validations, row, ref }) => {
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
          defaultMessage: 'Wählen Sie den anzuzeigenden Diagramm-Typ',
        })
      }
      ref={ref}
    />
  )
}
