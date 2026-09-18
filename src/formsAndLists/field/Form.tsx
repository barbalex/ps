import { useParams } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import type { InputOnChangeData } from '@fluentui/react-components'

import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { WidgetType } from './WidgetType.tsx'
import { TableAndLevel } from './TableAndLevel.tsx'
import type Fields from '../../models/public/Fields.ts'

import '../../form.css'

const widgetsNeedingList = [
  '018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe',
  '018ca1a1-c94b-7d29-b21c-42053ade0411',
] // options-few, options-many

type Props = {
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    data?: InputOnChangeData,
  ) => void
  validations?: Record<
    string,
    { state: 'error' | 'warning' | 'success' | 'none'; message: string } | undefined
  >
  row: Record<string, unknown>
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  isInForm?: boolean
  from?: string
}

export const FieldForm = ({
  onChange,
  validations = {},
  row,
  autoFocusRef,
  isInForm = false,
}: Props) => {
  const { projectId } = useParams({ strict: false })
  const { formatMessage } = useIntl()

  const fieldsRow = row as unknown as Fields
  // Switch uses a different onChange data shape at runtime
  const onChangeLoose = onChange as unknown as (
    e: React.ChangeEvent<unknown>,
    data?: unknown,
  ) => void

  const widgetNeedsList = widgetsNeedingList.includes(
    fieldsRow?.widget_type_id as string,
  )

  return (
    <>
      {!isInForm && (
        <TableAndLevel
          projectId={projectId}
          onChange={onChange}
          row={row}
          validations={validations}
          autoFocusRef={autoFocusRef}
        />
      )}
      <TextField
        label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        name="name"
        value={fieldsRow.name ?? ''}
        onChange={onChange}
        validationState={validations?.name?.state}
        validationMessage={
          validations.name?.message ??
          (fieldsRow.name
            ? undefined
            : formatMessage({ id: 'Rq3wXp', defaultMessage: 'Pflichtfeld' }))
        }
      />
      <TextField
        label={formatMessage({ id: 'Fl3jPw', defaultMessage: 'Bezeichnung' })}
        name="field_label"
        value={fieldsRow.field_label ?? ''}
        onChange={onChange}
        validationState={validations?.field_label?.state}
        validationMessage={validations?.field_label?.message}
      />
      <DropdownField
        label={formatMessage({ id: 'LTiTmL', defaultMessage: 'Feld-Typ' })}
        name="field_type_id"
        table="field_types"
        orderBy="sort, name"
        value={fieldsRow.field_type_id ?? ''}
        onChange={onChange}
        validationState={validations?.field_type_id?.state}
        validationMessage={
          validations.field_type_id?.message ??
          (fieldsRow.field_type_id ? undefined : 'Required')
        }
      />
      <WidgetType
        onChange={onChange}
        validations={validations}
        field_type_id={fieldsRow.field_type_id}
        value={fieldsRow.widget_type_id}
      />
      {widgetNeedsList && (
        <DropdownField
          label={formatMessage({ id: '4+BE1s', defaultMessage: 'Liste' })}
          name="list_id"
          table="lists"
          value={fieldsRow.list_id ?? ''}
          onChange={onChange}
          validationState={validations?.list_id?.state}
          validationMessage={validations?.list_id?.message}
        />
      )}
      <TextField
        label={formatMessage({ id: 'Ps5mVn', defaultMessage: 'Standardwert' })}
        name="preset"
        value={fieldsRow.preset ?? ''}
        onChange={onChange}
        validationState={validations?.preset?.state}
        validationMessage={validations?.preset?.message}
      />
      <SwitchField
        label={formatMessage({ id: 'Ob2kQz', defaultMessage: 'Obsolet' })}
        name="obsolete"
        value={fieldsRow.obsolete ?? false}
        type="number"
        onChange={onChangeLoose}
        validationState={validations?.obsolete?.state}
        validationMessage={
          validations.obsolete?.message ??
          formatMessage({
            id: 'Qr6tBm',
            defaultMessage:
              'Ist das Feld obsolet, werden bestehende Daten angezeigt, aber das Feld steht in neuen Datensätzen nicht zur Verfügung',
          })
        }
      />
    </>
  )
}
