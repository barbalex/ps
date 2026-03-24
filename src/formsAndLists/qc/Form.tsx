import * as fluentUiReactComponents from '@fluentui/react-components'
import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { SqlEditorField } from '../../components/shared/SqlEditorField.tsx'

import '../../form.css'

const { Dropdown, Field, Option } = fluentUiReactComponents

type Opt = { id: string; table_name: string; place_level: string | null }

// Combined table + level options, ordered and grouped like the chart subject's Tabelle field.
// Labels use generic level names since qcs are not project-specific.
const opts: Opt[] = [
  { id: 'accounts', table_name: 'accounts', place_level: null },
  { id: 'users', table_name: 'users', place_level: null },
  { id: 'field_types', table_name: 'field_types', place_level: null },
  { id: 'widget_types', table_name: 'widget_types', place_level: null },
  {
    id: 'widgets_for_fields',
    table_name: 'widgets_for_fields',
    place_level: null,
  },
  { id: 'fields', table_name: 'fields', place_level: null },
  { id: 'crs', table_name: 'crs', place_level: null },
  { id: 'files', table_name: 'files', place_level: null },
  { id: 'messages', table_name: 'messages', place_level: null },
  { id: 'projects', table_name: 'projects', place_level: null },
  { id: 'subprojects', table_name: 'subprojects', place_level: null },
  { id: 'places_1', table_name: 'places', place_level: '1' },
  { id: 'checks_1', table_name: 'checks', place_level: '1' },
  {
    id: 'check_quantities_1',
    table_name: 'check_quantities',
    place_level: '1',
  },
  { id: 'actions_1', table_name: 'actions', place_level: '1' },
  {
    id: 'action_quantities_1',
    table_name: 'action_quantities',
    place_level: '1',
  },
  { id: 'places_2', table_name: 'places', place_level: '2' },
  { id: 'checks_2', table_name: 'checks', place_level: '2' },
  {
    id: 'check_quantities_2',
    table_name: 'check_quantities',
    place_level: '2',
  },
  { id: 'actions_2', table_name: 'actions', place_level: '2' },
  {
    id: 'action_quantities_2',
    table_name: 'action_quantities',
    place_level: '2',
  },
]

// this form is rendered from the item view and from the filter
export const QcForm = ({ onChange, validations = {}, row, autoFocusRef }) => {
  const { formatMessage } = useIntl()

  // Build the parameter hint based on which level flags are set
  const paramHint = (() => {
    const parts: string[] = []
    if (row?.is_root_level) {
      parts.push(
        formatMessage({
          id: 'qc.sql.hintRoot',
          defaultMessage: 'Root level: no parameters needed.',
        }),
      )
    }
    if (row?.is_project_level) {
      parts.push(
        formatMessage({
          id: 'qc.sql.hintProject',
          defaultMessage: 'Project level: $1 = project_id (uuid)',
        }),
      )
    }
    if (row?.is_subproject_level) {
      parts.push(
        formatMessage({
          id: 'qc.sql.hintSubproject',
          defaultMessage: 'Subproject level: $1 = subproject_id (uuid)',
        }),
      )
    }
    return parts.length
      ? parts.join('\n')
      : formatMessage({
          id: 'qc.sql.hintNone',
          defaultMessage:
            'Set is_root_level, is_project_level or is_subproject_level to see available parameters.',
        })
  })()

  const tableOptLabelMap: Record<string, string> = {
    accounts: formatMessage({ id: 'qc.accounts', defaultMessage: 'Konten' }),
    users: formatMessage({ id: 'qc.users', defaultMessage: 'Benutzer' }),
    field_types: formatMessage({
      id: 'qc.fieldTypes',
      defaultMessage: 'Feld-Typen',
    }),
    widget_types: formatMessage({
      id: 'qc.widgetTypes',
      defaultMessage: 'Widget-Typen',
    }),
    widgets_for_fields: formatMessage({
      id: 'qc.widgetsForFields',
      defaultMessage: 'Widgets für Felder',
    }),
    fields: formatMessage({ id: 'qc.fields', defaultMessage: 'Felder' }),
    crs: formatMessage({ id: 'qc.crs', defaultMessage: 'KBS' }),
    files: formatMessage({ id: 'qc.files', defaultMessage: 'Dateien' }),
    messages: formatMessage({ id: 'qc.messages', defaultMessage: 'Meldungen' }),
    projects: formatMessage({ id: 'qc.projects', defaultMessage: 'Projekte' }),
    subprojects: formatMessage({
      id: 'bEaAfF',
      defaultMessage: 'Teilprojekte',
    }),
    places_1: formatMessage({
      id: 'qc.places1',
      defaultMessage: 'Orte (Stufe 1)',
    }),
    checks_1: formatMessage({
      id: 'qc.checks1',
      defaultMessage: 'Kontrollen (Stufe 1)',
    }),
    check_quantities_1: formatMessage({
      id: 'qc.checkQuantities1',
      defaultMessage: 'Kontroll-Mengen (Stufe 1)',
    }),
    actions_1: formatMessage({
      id: 'qc.actions1',
      defaultMessage: 'Massnahmen (Stufe 1)',
    }),
    action_quantities_1: formatMessage({
      id: 'qc.actionQuantities1',
      defaultMessage: 'Massnahmen-Mengen (Stufe 1)',
    }),
    places_2: formatMessage({
      id: 'qc.places2',
      defaultMessage: 'Orte (Stufe 2)',
    }),
    checks_2: formatMessage({
      id: 'qc.checks2',
      defaultMessage: 'Kontrollen (Stufe 2)',
    }),
    check_quantities_2: formatMessage({
      id: 'qc.checkQuantities2',
      defaultMessage: 'Kontroll-Mengen (Stufe 2)',
    }),
    actions_2: formatMessage({
      id: 'qc.actions2',
      defaultMessage: 'Massnahmen (Stufe 2)',
    }),
    action_quantities_2: formatMessage({
      id: 'qc.actionQuantities2',
      defaultMessage: 'Massnahmen-Mengen (Stufe 2)',
    }),
  }

  // Derive the combined id from the two separate DB fields
  const combinedValue = row?.table_name
    ? row?.place_level
      ? `${row.table_name}_${row.place_level}`
      : row.table_name
    : ''

  // Selecting a combined option sets both table_name and place_level
  const handleTableChange = (_e, data) => {
    const opt = opts.find((o) => o.id === data?.value) ?? null
    onChange(
      {
        target: { name: 'table_name', type: 'radio' },
      } as React.ChangeEvent<HTMLInputElement>,
      { value: opt?.table_name ?? null },
    )
    onChange(
      {
        target: { name: 'place_level', type: 'radio' },
      } as React.ChangeEvent<HTMLInputElement>,
      { value: opt?.place_level ? Number(opt.place_level) : null },
    )
  }

  return (
    <>
      <TextField
        label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        name="name"
        value={row?.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationMessage={validations?.name?.message}
        validationState={validations?.name?.state}
      />
      <TextField
        label={formatMessage({
          id: 'qc.labelDe',
          defaultMessage: 'Bezeichnung (DE)',
        })}
        name="label_de"
        value={row?.label_de ?? ''}
        onChange={onChange}
      />
      <TextField
        label={formatMessage({
          id: 'qc.labelEn',
          defaultMessage: 'Bezeichnung (EN)',
        })}
        name="label_en"
        value={row?.label_en ?? ''}
        onChange={onChange}
      />
      <TextField
        label={formatMessage({
          id: 'qc.labelFr',
          defaultMessage: 'Bezeichnung (FR)',
        })}
        name="label_fr"
        value={row?.label_fr ?? ''}
        onChange={onChange}
      />
      <TextField
        label={formatMessage({
          id: 'qc.labelIt',
          defaultMessage: 'Bezeichnung (IT)',
        })}
        name="label_it"
        value={row?.label_it ?? ''}
        onChange={onChange}
      />
      <Field
        label={formatMessage({ id: 'qc.tableName', defaultMessage: 'Tabelle' })}
        validationMessage={validations?.table_name?.message}
        validationState={validations?.table_name?.state ?? 'none'}
      >
        <Dropdown
          name="table_name"
          value={tableOptLabelMap[combinedValue] ?? ''}
          selectedOptions={combinedValue ? [combinedValue] : []}
          onOptionSelect={(_e, data) =>
            handleTableChange(null, { value: data.optionValue })
          }
          appearance="underline"
          clearable
        >
          {opts.map((o) => (
            <Option
              key={o.id}
              value={o.id}
            >
              {tableOptLabelMap[o.id] ?? o.id}
            </Option>
          ))}
        </Dropdown>
      </Field>
      <SwitchField
        label={formatMessage({
          id: 'qc.isRootLevel',
          defaultMessage: 'Root-Ebene',
        })}
        name="is_root_level"
        value={row?.is_root_level}
        onChange={onChange}
      />
      <SwitchField
        label={formatMessage({
          id: 'qc.isProjectLevel',
          defaultMessage: 'Projekt-Ebene',
        })}
        name="is_project_level"
        value={row?.is_project_level}
        onChange={onChange}
      />
      <SwitchField
        label={formatMessage({
          id: 'qc.isSubprojectLevel',
          defaultMessage: 'Teilprojekt-Ebene',
        })}
        name="is_subproject_level"
        value={row?.is_subproject_level}
        onChange={onChange}
      />
      <TextField
        label={formatMessage({
          id: 'qc.description',
          defaultMessage: 'Beschreibung',
        })}
        name="description"
        value={row?.description ?? ''}
        onChange={onChange}
        validationMessage={validations?.description?.message}
        validationState={validations?.description?.state}
      />
      <SqlEditorField
        label={formatMessage({ id: 'qc.sql', defaultMessage: 'SQL' })}
        name="sql"
        value={row?.sql ?? ''}
        onChange={onChange}
        hint={paramHint}
        validationMessage={validations?.sql?.message}
        validationState={validations?.sql?.state}
      />
      <TextField
        label={formatMessage({
          id: 'Pq7nWk',
          defaultMessage: 'Sortier-Reihenfolge',
        })}
        name="sort"
        value={row?.sort ?? ''}
        type="number"
        onChange={onChange}
        validationMessage={validations?.sort?.message}
        validationState={validations?.sort?.state}
      />
    </>
  )
}
