import { useIntl } from 'react-intl'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { chartSubjectCalcMethodOptions } from '../../modules/constants.ts'

export const ValueSource = ({ onChange, row, validations }) => {
  const { formatMessage } = useIntl()

  const list = chartSubjectCalcMethodOptions.map((o) => o.value)
  const labelMap = Object.fromEntries(
    chartSubjectCalcMethodOptions.map((o) => [
      o.value,
      formatMessage({ id: o.labelId, defaultMessage: o.defaultMessage }),
    ]),
  )

  return (
    <RadioGroupField
      label={formatMessage({
        id: 'bDgJmK',
        defaultMessage: 'Berechnungsmethode',
      })}
      name="calc_method"
      list={list}
      value={row.calc_method ?? ''}
      onChange={onChange}
      labelMap={labelMap}
      validationState={validations?.calc_method?.state}
      validationMessage={validations.calc_method?.message}
    />
  )
}
