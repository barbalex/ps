import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../../components/shared/RadioGroupFromOptions.tsx'
import { projectTypeOptions } from '../../../modules/constants.ts'

export const Type = ({ onChange, validations, row }) => {
  const { formatMessage } = useIntl()

  const options = projectTypeOptions.map(
    ({ value, labelId, defaultMessage }) => ({
      value,
      label: formatMessage({ id: labelId, defaultMessage }),
    }),
  )

  return (
    <RadioGroupFromOptions
      label={formatMessage({ id: 'wA1BcD', defaultMessage: 'Projekttyp' })}
      name="type"
      options={options}
      value={row.type ?? ''}
      onChange={onChange}
      validationState={validations?.type?.state}
      validationMessage={
        validations?.type?.message ??
        formatMessage({
          id: 'oT4UvW',
          defaultMessage:
            'Arten wählen, um deren (Teil-)Populationen zu bearbeiten. Biotope für (Teil-)Biotope bzw. Lebensräume',
        })
      }
    />
  )
}
