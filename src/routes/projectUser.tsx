import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { Button, Field, RadioGroup, Radio } from '@fluentui/react-components'

import { ProjectUsers as ProjectUser } from '../../../generated/client'
import { projectUser as createProjectUserPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'

import '../form.css'

export const Component = () => {
  const { project_id, project_user_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.project_users.liveUnique({ where: { project_user_id } }),
    [project_user_id],
  )

  const addRow = async () => {
    const newProjectUser = createProjectUserPreset()
    await db.project_users.create({
      data: { ...newProjectUser, project_id },
    })
    navigate(`/projects/${project_id}/users/${newProjectUser.project_user_id}`)
  }

  const deleteRow = async () => {
    await db.project_users.delete({
      where: {
        project_user_id,
      },
    })
    navigate(`/projects/${project_id}/users`)
  }

  const row: ProjectUser = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.project_users.update({
        where: { project_user_id },
        data: { [name]: value },
      })
    },
    [db.project_users, project_user_id],
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
          title="Add new project user"
        />
        <Button
          size="large"
          icon={<FaMinus />}
          onClick={deleteRow}
          title="Delete project user"
        />
      </div>
      <TextFieldInactive
        label="ID"
        name="project_user_id"
        value={row.project_user_id}
      />
      <TextField
        label="User"
        name="user_id"
        value={row.user_id ?? ''}
        onChange={onChange}
      />
      <Field label="Role">
        <RadioGroup
          layout="horizontal"
          value={row.role ?? ''}
          name="role"
          onChange={onChange}
        >
          <Radio label="Reader" value="reader" />
          <Radio label="Editor" value="editor" />
          <Radio label="Manager" value="manager" />
        </RadioGroup>
      </Field>
    </div>
  )
}
