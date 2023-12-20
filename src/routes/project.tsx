import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import {
  Button,
  Field,
  RadioGroup,
  Radio,
  Switch,
} from '@fluentui/react-components'

import { Projects as Project } from '../../../generated/client'
import { project as createProjectPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'

import '../form.css'

export const Component = () => {
  const { project_id } = useParams<{
    project_id: string
  }>()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.projects.liveUnique({ where: { project_id } }),
    [project_id],
  )

  const addRow = async () => {
    const newProject = createProjectPreset()
    await db.projects.create({
      data: newProject,
    })
    navigate(`/projects/${newProject.project_id}`)
  }

  const deleteRow = async () => {
    await db.projects.delete({
      where: {
        project_id,
      },
    })
    navigate(`/projects`)
  }

  const row: Project = results

  const onChange = useCallback(
    (e, data) => {
      const targetType = e.target.type
      const value =
        targetType === 'checkbox'
          ? data.checked
          : targetType === 'number'
          ? e.target.valueAsNumber ?? null
          : e.target.value ?? null
      const name = e.target.name
      // console.log('onChange', {
      //   name,
      //   targetType,
      //   value,
      // })
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

  return (
    <div className="form-container">
      <div className="controls">
        <Button
          size="large"
          icon={<FaPlus />}
          onClick={addRow}
          title="Add new project"
        />
        <Button
          size="large"
          icon={<FaMinus />}
          onClick={deleteRow}
          title="Delete project"
        />
      </div>
      <TextFieldInactive label="ID" name="project_id" value={row.project_id} />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
      />
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
      <Field label="Value(s) to use when Values exist on multiple place levels">
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
      <Field label="Value(s) to use when multiple action Values exist on the same place level">
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
      <Field label="Value(s) to use when multiple check Values exist on the same place level">
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
      <Switch
        label="Enable uploading files to projects"
        name="files_active"
        checked={row.files_active ?? false}
        onChange={onChange}
      />
    </div>
  )
}
