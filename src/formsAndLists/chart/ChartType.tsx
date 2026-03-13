import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useIntl } from 'react-intl'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

export const ChartType = ({ onChange, validations, row, ref }) => {
  const { formatMessage } = useIntl()
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT chart_type FROM chart_types order by sort, chart_type`,
  )
  const isLoading = isFirstRender && res === undefined
  const list = res?.rows.map((row) => row.chart_type) ?? []

  return (
    <RadioGroupField
      label={formatMessage({ id: 'bCHkLm', defaultMessage: 'Diagramm-Typ' })}
      name="chart_type"
      list={list}
      isLoading={isLoading}
      value={row.chart_type ?? ''}
      onChange={onChange}
      autoFocus
      validationState={validations?.chart_type?.state}
      validationMessage={
        validations.chart_type?.message ??
        formatMessage({ id: 'bCIlMn', defaultMessage: 'Wählen Sie den anzuzeigenden Diagramm-Typ' })
      }
      ref={ref}
    />
  )
}
