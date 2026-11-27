import { useParams } from '@tanstack/react-router'
import { useIntl } from 'react-intl'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { WidgetType } from './WidgetType.tsx'
import { FollowupSettings } from './FollowupSettings.tsx'
import { TableAndLevel } from './TableAndLevel.tsx'
import type Fields from '../../models/public/Fields.ts'

import '../../form.css'
import type { FieldChangeData } from '../../components/shared/fieldChange.ts'

type Props = {
  onChange: (e: React.ChangeEvent<HTMLElement>, data?: FieldChangeData) => void
  validations?: Record<
    string,
    | { state: 'error' | 'warning' | 'success' | 'none'; message: string }
    | undefined
  >
  row: Fields | Record<string, never>
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

  const widget = useLiveQuery<{
    needs_list: boolean
    name: string
    list_type: string
  }>(
    `SELECT w.needs_list, w.name, CASE WHEN f.name='decimal' THEN 'numeric' ELSE f.name END AS list_type
     FROM widget_types w LEFT JOIN field_types f ON f.field_type_id=$2 WHERE w.widget_type_id=$1`,
    [fieldsRow.widget_type_id || null, fieldsRow.field_type_id || null],
  )?.rows[0]
  const multi = widget?.name.startsWith('multiselect-')

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
          (fieldsRow.name ? undefined : (
            formatMessage({ id: 'Rq3wXp', defaultMessage: 'Pflichtfeld' })
          ))
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
      {fieldsRow.field_id && (
        <FollowupSettings
          row={fieldsRow}
          onChange={onChange}
          validations={validations}
        />
      )}
      {widget?.needs_list && (
        <DropdownField
          label={formatMessage({ id: '4+BE1s', defaultMessage: 'Liste' })}
          name="list_id"
          table="lists"
          where={
            multi ?
              'value_type::text=$1 AND (project_id IS NULL OR project_id=$2)'
            : undefined
          }
          params={
            multi ?
              [widget.list_type, fieldsRow.project_id ?? projectId ?? null]
            : undefined
          }
          value={fieldsRow.list_id ?? ''}
          onChange={onChange}
          validationState={validations?.list_id?.state}
          validationMessage={validations?.list_id?.message}
        />
      )}
      {widget?.name === 'text' &&
        ['integer', 'numeric'].includes(widget.list_type) && (
          <>
            <TextField
              label={formatMessage({ id: 'sTk6C3', defaultMessage: 'Einheit' })}
              name="numeric_unit"
              value={fieldsRow.numeric_unit ?? ''}
              onChange={onChange}
              validationState={validations.numeric_unit?.state}
              validationMessage={validations.numeric_unit?.message}
            />
            {(
              [
                [
                  'numeric_min',
                  formatMessage({
                    id: 'numericMin',
                    defaultMessage: 'Minimum',
                  }),
                ],
                [
                  'numeric_max',
                  formatMessage({
                    id: 'numericMax',
                    defaultMessage: 'Maximum',
                  }),
                ],
                [
                  'numeric_step',
                  formatMessage({
                    id: 'numericStep',
                    defaultMessage: 'Schrittweite',
                  }),
                ],
              ] as const
            ).map(([name, label]) => (
              <TextField
                key={name}
                name={name}
                label={label}
                type={widget.list_type === 'integer' ? 'number' : 'text'}
                inputMode={
                  widget.list_type === 'numeric' ? 'decimal' : undefined
                }
                numericSettings={{
                  positive: name === 'numeric_step',
                  numeric_min:
                    name === 'numeric_max' ? fieldsRow.numeric_min : null,
                  numeric_max:
                    name === 'numeric_min' ? fieldsRow.numeric_max : null,
                }}
                value={fieldsRow[name] ?? ''}
                onChange={onChange}
                validationState={validations[name]?.state}
                validationMessage={validations[name]?.message}
              />
            ))}
          </>
        )}
      {!multi && widget?.name !== 'boolean-buttons' && (
        <TextField
          label={formatMessage({
            id: 'Ps5mVn',
            defaultMessage: 'Standardwert',
          })}
          name="preset"
          value={fieldsRow.preset ?? ''}
          onChange={onChange}
          validationState={validations?.preset?.state}
          validationMessage={validations?.preset?.message}
        />
      )}
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
