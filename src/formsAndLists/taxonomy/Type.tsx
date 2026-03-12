import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { RadioGroupFromOptions } from '../../components/shared/RadioGroupFromOptions.tsx'

export const Type = ({ onChange, row, validations = {} }) => {
  const { formatMessage } = useIntl()
  const res = useLiveQuery(
    `SELECT type FROM taxonomy_types order by sort, type`,
  )

  const typeLabels: Record<string, string> = {
    species: formatMessage({ id: 'xE2FgH', defaultMessage: 'Arten' }),
    biotope: formatMessage({ id: 'yI3JkL', defaultMessage: 'Biotope' }),
  }

  const options = (res?.rows ?? []).map((r) => ({
    value: r.type,
    label: typeLabels[r.type] ?? r.type,
  }))

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
