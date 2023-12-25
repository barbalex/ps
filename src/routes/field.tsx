import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { Switch } from '@fluentui/react-components'

import { Fields as Field } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { field as createFieldPreset } from '../modules/dataPresets'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DropdownFieldSimpleOptions } from '../components/shared/DropdownFieldSimpleOptions'
import { DropdownField } from '../components/shared/DropdownField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

const tables = [
  'action_reports',
  'actions',
  'checks',
  'files',
  'goal_reports',
  'goals',
  'lists',
  'observation_sources',
  'observations',
  'persons',
  'place_reports',
  'places',
  'project_reports',
  'projects',
  'subproject_reports',
  'subprojects',
  'taxonomies',
]

export const Component = () => {
  const { project_id, field_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.fields.liveUnique({ where: { field_id } }),
  )

  const addRow = useCallback(async () => {
    const newField = createFieldPreset()
    await db.fields.create({
      data: { ...newField, project_id },
    })
    navigate(`/projects/${project_id}/persons/${newField.field_id}`)
  }, [db.fields, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.fields.delete({
      where: {
        field_id,
      },
    })
    navigate(`/projects/${project_id}/fields`)
  }, [db.fields, field_id, navigate, project_id])

  const row: Field = results

  const fieldTypeWhere = useMemo(() => ({ deleted: false }), [])
  const fieldTypeOrderBy = useMemo(() => [{ sort: 'asc' }, { name: 'asc' }], [])

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.fields.update({
        where: { field_id },
        data: { [name]: value },
      })
    },
    [db.fields, field_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="field" />
      <TextFieldInactive label="ID" name="field_id" value={row.field_id} />
      <DropdownFieldSimpleOptions
        label="Table"
        name="table_name"
        value={row.table_name ?? ''}
        onChange={onChange}
        options={tables}
      />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
      />
      <DropdownField
        label="Type"
        name="field_type_id"
        table="field_types"
        where={fieldTypeWhere}
        orderBy={fieldTypeOrderBy}
        value={row.field_type_id ?? ''}
        onChange={onChange}
      />
      <DropdownField
        label="Widget"
        name="widget_type_id"
        table="widget_types"
        value={row.widget_type_id ?? ''}
        onChange={onChange}
      />
      <DropdownField
        label="List"
        name="list_id"
        table="lists"
        value={row.list_id ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Preset value"
        name="preset"
        value={row.preset ?? ''}
        onChange={onChange}
      />
      <Switch
        label="Obsolete"
        name="obsolete"
        checked={row.obsolete ?? false}
        onChange={onChange}
      />
    </div>
  )
}
