import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions.tsx'
import { taxonomyTypeOptions } from '../../modules/constants.ts'

export const Type = ({ onChange, row, validations = {} }) => {
  const { formatMessage } = useIntl()

  const options = taxonomyTypeOptions.map(
    ({ value, labelId, defaultMessage }) => ({
      value,
      label: formatMessage({ id: labelId, defaultMessage }),
    }),
  )

  return (
    <RadioGroupFromOptions
      label={formatMessage({ id: 'xTeBn/', defaultMessage: 'Typ' })}
      name="type"
      options={options}
      value={row.type ?? ''}
      onChange={onChange}
      validationState={validations?.type?.state}
      validationMessage={validations?.type?.message}
    />
  )
}
