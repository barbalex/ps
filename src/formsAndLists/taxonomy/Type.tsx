import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions.tsx'
import { taxonomyTypeOptions } from '../../modules/constants.ts'
import type Taxonomies from '../../models/public/Taxonomies.ts'
import type { FieldChangeHandler } from '../../components/shared/fieldChange.ts'

export const Type = ({
  onChange,
  row,
  validations = {},
}: {
  onChange: FieldChangeHandler
  row: Taxonomies | Record<string, never>
  validations?: Record<string, { state: 'error'; message: string }>
}) => {
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
      onChange={(ev) => onChange(ev as React.ChangeEvent<HTMLInputElement>)}
      validationState={validations?.type?.state}
      validationMessage={validations?.type?.message}
    />
  )
}
