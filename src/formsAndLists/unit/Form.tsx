import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { unitTypeOptions } from '../../modules/constants.ts'

import '../../form.css'

// this form is rendered from a parent or outlet
export const UnitForm = ({ onChange, row, autoFocusRef, validations = {} }) => {
  const { formatMessage } = useIntl()

  const unitTypeLabelMap = Object.fromEntries(
    unitTypeOptions.map((o) => [
      o.value,
      formatMessage({ id: o.labelId, defaultMessage: o.defaultMessage }),
    ]),
  )
  const unitTypeList = unitTypeOptions.map((o) => o.value)

  return (
    <>
      <TextField
        label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.name?.state}
        validationMessage={validations?.name?.message}
      />
      <RadioGroupField
        label={formatMessage({ id: 'uT5VwX', defaultMessage: 'Typ' })}
        name="type"
        list={unitTypeList}
        value={row.type ?? ''}
        onChange={onChange}
        validationState={validations?.type?.state}
        validationMessage={validations?.type?.message}
        labelMap={unitTypeLabelMap}
        layout="horizontal"
      />
      <SwitchField
        label={formatMessage({ id: 'Eh8IjK', defaultMessage: 'Summierbar' })}
        name="summable"
        value={row.summable ?? false}
        onChange={onChange}
        validationState={validations?.summable?.state}
        validationMessage={
          validations?.summable?.message ??
          formatMessage({
            id: 'Eh9JkL',
            defaultMessage:
              'Gibt an, ob Werte dieser Einheit summiert werden können. Falls nicht summierbar, wird die Verteilung der Anzahl pro Wert angezeigt.',
          })
        }
      />
      <DropdownField
        label={formatMessage({
          id: 'Ls6dFg',
          defaultMessage: 'Liste (Werte aus Liste verwenden)',
        })}
        name="list_id"
        table="lists"
        where={`project_id = '${row.project_id}'`}
        value={row.list_id ?? ''}
        onChange={onChange}
        validationState={validations?.list_id?.state}
        validationMessage={validations?.list_id?.message}
        hideWhenNoData
      />
      <TextField
        label={formatMessage({ id: 'Pq7nWk', defaultMessage: 'Sortierwert' })}
        name="sort"
        type="number"
        value={row.sort ?? ''}
        onChange={onChange}
        validationState={validations?.sort?.state}
        validationMessage={
          validations?.sort?.message ??
          formatMessage({
            id: 'Pq8RsT',
            defaultMessage:
              'Standardmässig wird nach Name sortiert. Das können Sie mit diesem Wert übersteuern: Je höher der Wert, desto weiter unten wird die Einheit angezeigt.',
          })
        }
      />
    </>
  )
}
