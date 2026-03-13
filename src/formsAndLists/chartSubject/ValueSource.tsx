import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useIntl } from 'react-intl'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

const labelMessages = {
  count_rows: { id: 'bDxAbB', defaultMessage: 'Zeilen z\u00e4hlen' },
  count_rows_by_distinct_field_values: {
    id: 'bDyCcD',
    defaultMessage: 'Zeilen pro Feldwert z\u00e4hlen',
  },
  sum_values_of_field: { id: 'bDzDeE', defaultMessage: 'Feldwerte summieren' },
}

export const ValueSource = ({ onChange, row, validations }) => {
  const { formatMessage } = useIntl()
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT calc_method FROM chart_subject_calc_methods order by sort, calc_method`,
  )
  const isLoading = isFirstRender && res === undefined
  const list = res?.rows.map((row) => row.calc_method) ?? []

  const labelMap = Object.fromEntries(
    Object.entries(labelMessages).map(([k, v]) => [k, formatMessage(v)]),
  )

  return (
    <RadioGroupField
      label={formatMessage({
        id: 'bDgJmK',
        defaultMessage: 'Berechnungsmethode',
      })}
      name="calc_method"
      list={list}
      isLoading={isLoading}
      value={row.calc_method ?? ''}
      onChange={onChange}
      labelMap={labelMap}
      validationState={validations?.calc_method?.state}
      validationMessage={validations.calc_method?.message}
    />
  )
}
