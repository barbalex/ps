import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Field,
  RadioGroup,
  Radio,
  Label,
  Checkbox,
  Divider,
} from '@fluentui/react-components'

import { Projects as Project } from '../../../generated/client'
import { project as createProjectPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.projects.liveUnique({ where: { project_id } }),
    [project_id],
  )

  const addRow = useCallback(async () => {
    const newProject = createProjectPreset()
    await db.projects.create({
      data: newProject,
    })
    navigate(`/projects/${newProject.project_id}`)
  }, [db.projects, navigate])

  const deleteRow = useCallback(async () => {
    await db.projects.delete({
      where: {
        project_id,
      },
    })
    navigate(`/projects`)
  }, [db.projects, navigate, project_id])

  const row: Project = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.projects.update({
        where: { project_id },
        data: { [name]: value },
      })
    },
    [db.projects, project_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  console.log('project, data:', row.data)

  return (
    <div className="form-container">
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="project" />
      <TextFieldInactive label="ID" name="project_id" value={row.project_id} />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
      />
      <Jsonb
        // key={`${row.project_id}${Object.keys(row.data ?? {}).length}`}
        table="projects"
        idField="project_id"
        id={row.project_id}
        data={row.data ?? {}}
      />
      <Divider />
      <Label>Project configuration</Label>
      <Field label="Type">
        <RadioGroup
          layout="horizontal"
          value={row.type ?? ''}
          name="type"
          onChange={onChange}
        >
          <Radio label="Species" value="species" />
          <Radio label="Biotope" value="biotope" />
        </RadioGroup>
      </Field>
      <TextField
        label="Name of subproject (singular)"
        name="subproject_name_singular"
        value={row.subproject_name_singular ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Name of subproject (plural)"
        name="subproject_name_plural"
        value={row.subproject_name_plural ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Order subproject by (field name)"
        name="subproject_order_by"
        value={row.subproject_order_by ?? ''}
        onChange={onChange}
      />
      <Divider />
      <Label>{`Value(s) to use in reports when:`}</Label>
      <Field label="...values exist on multiple place levels">
        <RadioGroup
          layout="horizontal"
          value={row.values_on_multiple_levels ?? ''}
          name="values_on_multiple_levels"
          onChange={onChange}
        >
          <Radio label="first level" value="first" />
          <Radio label="second level" value="second" />
          <Radio label="all levels" value="all" />
        </RadioGroup>
      </Field>
      <Field label="...multiple action values exist on the same place level">
        <RadioGroup
          layout="horizontal"
          value={row.multiple_action_values_on_same_level ?? ''}
          name="multiple_action_values_on_same_level"
          onChange={onChange}
        >
          <Radio label="first" value="first" />
          <Radio label="last" value="last" />
          <Radio label="all" value="all" />
        </RadioGroup>
      </Field>
      <Field label="...multiple check Values exist on the same place level">
        <RadioGroup
          layout="horizontal"
          value={row.multiple_check_values_on_same_level ?? ''}
          name="multiple_check_values_on_same_level"
          onChange={onChange}
        >
          <Radio label="first" value="first" />
          <Radio label="last" value="last" />
          <Radio label="all" value="all" />
        </RadioGroup>
      </Field>
      <Divider />
      <Label>Enable uploading files to:</Label>
      <Checkbox
        label="Projects"
        name="files_active_projects"
        checked={row.files_active_projects ?? false}
        onChange={onChange}
      />
      <Checkbox
        label="Project reports"
        name="files_active_projects_reports"
        checked={row.files_active_projects_reports ?? false}
        onChange={onChange}
      />
      <Checkbox
        label="Subprojects"
        name="files_active_subprojects"
        checked={row.files_active_subprojects ?? false}
        onChange={onChange}
      />
      <Checkbox
        label="Subproject reports"
        name="files_active_subproject_reports"
        checked={row.files_active_subproject_reports ?? false}
        onChange={onChange}
      />
      <Checkbox
        label="Places"
        name="files_active_places"
        checked={row.files_active_places ?? false}
        onChange={onChange}
      />
      <Checkbox
        label="Actions"
        name="files_active_actions"
        checked={row.files_active_actions ?? false}
        onChange={onChange}
      />
      <Checkbox
        label="Checks"
        name="files_active_checks"
        checked={row.files_active_checks ?? false}
        onChange={onChange}
      />
      <Checkbox
        label="Check reports"
        name="files_active_check_reports"
        checked={row.files_active_check_reports ?? false}
        onChange={onChange}
      />
    </div>
  )
}
