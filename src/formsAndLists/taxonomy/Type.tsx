import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions.tsx'
import { taxonomyTypeOptions } from '../../modules/constants.ts'
import type Taxonomies from '../../models/public/Taxonomies.ts'

export const Type = ({
  onChange,
  row,
  validations = {},
}: {
  onChange: (e: React.ChangeEvent<any>, data?: any) => void
  row: Taxonomies | Record<string, any>
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
