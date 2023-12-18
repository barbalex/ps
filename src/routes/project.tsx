import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
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
import { project as projectPreset } from '../modules/dataPresets'

import '../form.css'

import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.projects.liveUnique({ where: { project_id } }),
    [project_id],
  )

  const addRow = async () => {
    const project_id = uuidv7()
    await db.projects.create({
      data: projectPreset,
    })
    navigate(`/projects/${project_id}`)
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

  const onChangeFluent = useCallback(
    (e, data) => {
      const value = 'checked' in data ? data.checked : data.value ?? undefined
      const name = e.target.name
      // console.log('onChangeFluent', {
      //   name,
      //   targetValue: e.target.value,
      //   data,
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
        onChange={onChangeFluent}
      />
      <Field label="Type">
        <RadioGroup
          layout="horizontal"
          value={row.type ?? ''}
          name="type"
          onChange={onChangeFluent}
        >
          <Radio label="Species" value="species" />
          <Radio label="Biotope" value="biotope" />
        </RadioGroup>
      </Field>
      <TextField
        label="Name of subproject (singular)"
        name="subproject_name_singular"
        value={row.subproject_name_singular ?? ''}
        onChange={onChangeFluent}
      />
      <TextField
        label="Name of subproject (plural)"
        name="subproject_name_plural"
        value={row.subproject_name_plural ?? ''}
        onChange={onChangeFluent}
      />
      <TextField
        label="Order subproject by (field name)"
        name="subproject_order_by"
        value={row.subproject_order_by ?? ''}
        onChange={onChangeFluent}
      />
      <Field label="Value(s) to use when Values exist on multiple place levels">
        <RadioGroup
          layout="horizontal"
          value={row.values_on_multiple_levels ?? ''}
          name="values_on_multiple_levels"
          onChange={onChangeFluent}
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
          onChange={onChangeFluent}
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
          onChange={onChangeFluent}
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
        onChange={onChangeFluent}
      />
    </div>
  )
}
