import { memo } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'

import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownFieldSimpleOptions } from '../../components/shared/DropdownFieldSimpleOptions.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { WidgetType } from './WidgetType.tsx'
import { accountTables } from '../../routes/field/accountTables.ts'

import '../../form.css'

const projectTables = [
  'action_reports',
  'actions',
  'checks',
  'goal_reports',
  'goals',
  'lists',
  'persons',
  'place_reports',
  'places',
  'project_reports',
  'subproject_reports',
  'subprojects',
  'taxonomies',
]

const widgetsNeedingList = [
  '018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe',
  '018ca1a1-c94b-7d29-b21c-42053ade0411',
] // options-few, options-many

// this form is rendered from a parent or outlet
export const Component = memo(
  ({
    onChange: onChangeFromProps,
    row: rowFromProps,
    autoFocusRef,
    isInForm = false,
  }) => {
    const { project_id } = useParams()
    // beware: contextFromOutlet is undefined if not inside an outlet
    const outletContext = useOutletContext()
    const onChange = onChangeFromProps ?? outletContext?.onChange
    const row = rowFromProps ?? outletContext?.row ?? {}

    const widgetNeedsList = widgetsNeedingList.includes(row?.widget_type_id)

    return (
      <>
        {!isInForm && (
          <>
            <DropdownFieldSimpleOptions
              label="Table"
              name="table_name"
              value={row.table_name ?? ''}
              onChange={onChange}
              options={project_id ? projectTables : accountTables}
              autoFocus
              ref={autoFocusRef}
              validationMessage={row.table_name ? undefined : 'Required'}
            />
            <TextField
              label="Level"
              name="level"
              value={row.level}
              type="number"
              onChange={onChange}
            />
          </>
        )}
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          validationMessage={row.name ? undefined : 'Required'}
        />
        <TextField
          label="Label"
          name="field_label"
          value={row.field_label ?? ''}
          onChange={onChange}
        />
        <DropdownField
          label="Type"
          name="field_type_id"
          table="field_types"
          orderBy="sort asc, name asc"
          value={row.field_type_id ?? ''}
          onChange={onChange}
          validationMessage={row.field_type_id ? undefined : 'Required'}
        />
        <WidgetType
          onChange={onChange}
          field_type_id={row.field_type_id}
          value={row.widget_type_id}
        />
        {widgetNeedsList && (
          <DropdownField
            label="List"
            name="list_id"
            table="lists"
            value={row.list_id ?? ''}
            onChange={onChange}
          />
        )}
        <TextField
          label="Preset value"
          name="preset"
          value={row.preset ?? ''}
          onChange={onChange}
        />
        <SwitchField
          label="Obsolete"
          name="obsolete"
          value={row.obsolete ?? false}
          type="number"
          onChange={onChange}
          validationMessage="If obsolete, existing data is shown but this field will not be available for new records"
        />
      </>
    )
  },
)
