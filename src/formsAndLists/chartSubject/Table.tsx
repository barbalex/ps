import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useIntl } from 'react-intl'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

const labelMessages = {
  subprojects: { id: 'bEaAfF', defaultMessage: 'Teilprojekte' },
  places: { id: 'bEbBgG', defaultMessage: 'Orte' },
  checks: { id: 'bEcChH', defaultMessage: 'Kontrollen' },
  check_values: { id: 'bEdDiI', defaultMessage: 'Kontrollwerte' },
  actions: { id: 'bEeEjJ', defaultMessage: 'Maßnahmen' },
  action_values: { id: 'bEfFkK', defaultMessage: 'Maßnahmenwerte' },
}

export const Table = ({ onChange, row, ref, validations }) => {
  const { formatMessage } = useIntl()
  const isFirstRender = useIsFirstRender()
  const res = useLiveQuery(
    `SELECT table_name FROM chart_subject_table_names order by sort, table_name`,
  )
  const isLoading = isFirstRender && res === undefined
  const list = res?.rows.map((row) => row.table_name) ?? []

  const labelMap = Object.fromEntries(
    Object.entries(labelMessages).map(([k, v]) => [k, formatMessage(v)]),
  )

  return (
    <RadioGroupField
      label={formatMessage({ id: 'bDcFiG', defaultMessage: 'Tabelle' })}
      name="table_name"
      list={list}
      isLoading={isLoading}
      value={row.table_name ?? ''}
      onChange={onChange}
      labelMap={labelMap}
      autoFocus
      ref={ref}
      validationState={validations?.table_name?.state}
      validationMessage={
        validations.table_name?.message ??
        formatMessage({
          id: 'bDdGjH',
          defaultMessage:
            'W\u00e4hlen Sie die Tabelle, aus der Daten geladen werden',
        })
      }
    />
  )
}
