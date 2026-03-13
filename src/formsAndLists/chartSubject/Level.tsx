import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useIntl } from 'react-intl'

import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'

export const Level = ({ onChange, row, validations }) => {
  const { formatMessage } = useIntl()
  const isFirstRender = useIsFirstRender()
  const disabled = !row.table_name || row.table_name === 'subprojects'
  const res = useLiveQuery(
    `SELECT level FROM chart_subject_table_levels order by level`,
  )
  const isLoading = isFirstRender && res === undefined
  const list = res?.rows.map((row) => row.level) ?? []

  return (
    <RadioGroupField
      label={formatMessage({ id: 'bDeHkI', defaultMessage: 'Stufe' })}
      name="table_level"
      list={list}
      isLoading={isLoading}
      value={row.table_level ?? ''}
      onChange={onChange}
      disabled={disabled}
      validationState={validations?.table_level?.state}
      validationMessage={
        validations.table_level?.message ??
        formatMessage({ id: 'bDfIlJ', defaultMessage: 'Ebene der Orte und der zugeh\u00f6rigen Kontrollen und Massnahmen' })
      }
    />
  )
}
