import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { Field, RadioGroup, Radio } from '@fluentui/react-components'

import { ProjectUsers as ProjectUser } from '../../../generated/client'
import { projectUser as createProjectUserPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, project_user_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.project_users.liveUnique({ where: { project_user_id } }),
    [project_user_id],
  )

  const addRow = useCallback(async () => {
    const newProjectUser = createProjectUserPreset()
    await db.project_users.create({
      data: { ...newProjectUser, project_id },
    })
    navigate(`/projects/${project_id}/users/${newProjectUser.project_user_id}`)
  }, [db.project_users, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.project_users.delete({
      where: {
        project_user_id,
      },
    })
    navigate(`/projects/${project_id}/users`)
  }, [db.project_users, navigate, project_id, project_user_id])

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
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        tableName="project user"
      />
      <TextFieldInactive
        label="ID"
        name="project_user_id"
        value={row.project_user_id}
      />
      <TextField
        label="User ID"
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
