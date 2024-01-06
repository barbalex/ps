import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ProjectUsers as ProjectUser } from '../../../generated/client'
import { projectUser as createProjectUser } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DropdownField } from '../components/shared/DropdownField'
import { RadioGroupField } from '../components/shared/RadioGroupField'
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
    const projectUser = createProjectUser()
    await db.project_users.create({
      data: { ...projectUser, project_id },
    })
    navigate(`/projects/${project_id}/users/${projectUser.project_user_id}`)
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

  const userWhere = useMemo(() => ({ deleted: false }), [])

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
      <DropdownField
        label="User"
        name="user_id"
        table="users"
        where={userWhere}
        value={row.user_id ?? ''}
        onChange={onChange}
        autoFocus
      />
      <RadioGroupField
        label="Role"
        name="role"
        list={['reader', 'editor', 'manager']}
        value={row.role ?? ''}
        onChange={onChange}
      />
    </div>
  )
}
