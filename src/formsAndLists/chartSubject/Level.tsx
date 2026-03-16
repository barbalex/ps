import { useIntl } from 'react-intl'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { chartSubjectTableLevelOptions } from '../../modules/constants.ts'

export const Level = ({ onChange, row, validations }) => {
  const { formatMessage } = useIntl()
  const disabled = !row.table_name || row.table_name === 'subprojects'
  const list = chartSubjectTableLevelOptions.map((o) => o.value)

  return (
    <RadioGroupField
      label={formatMessage({ id: 'bDeHkI', defaultMessage: 'Stufe' })}
      name="table_level"
      list={list}
      value={row.table_level ?? ''}
      onChange={onChange}
      disabled={disabled}
      validationState={validations?.table_level?.state}
      validationMessage={
        validations.table_level?.message ??
        formatMessage({
          id: 'bDfIlJ',
          defaultMessage:
            'Ebene der Orte und der zugeh\u00f6rigen Kontrollen und Massnahmen',
        })
      }
    />
  )
}
