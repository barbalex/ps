import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../../components/shared/RadioGroupFromOptions.tsx'
import { projectTypeOptions } from '../../../modules/constants.ts'
import type Projects from '../../../models/public/Projects.ts'

export const Type = ({
  onChange,
  validations,
  row,
}: {
  onChange: (e: React.ChangeEvent<any>, data?: any) => void
  validations: Record<string, { state: 'error'; message: string }>
  row: Projects
}) => {
  const { formatMessage } = useIntl()

  const options = projectTypeOptions.map(
    ({ value, labelId, defaultMessage }) => ({
      value,
      label: formatMessage({ id: labelId, defaultMessage }),
    }),
  )

  return (
    <RadioGroupFromOptions
      label={formatMessage({ id: 'wA1BcD', defaultMessage: 'Projekt-Typ' })}
      name="type"
      options={options}
      value={row.type ?? ''}
      onChange={(ev) => onChange(ev as React.ChangeEvent<HTMLInputElement>)}
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
