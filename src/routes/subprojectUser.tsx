import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { SubprojectUsers as SubprojectUser } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { subprojectUser as createSubprojectUser } from '../modules/dataPresets'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DropdownField } from '../components/shared/DropdownField'
import { RadioGroupField } from '../components/shared/RadioGroupField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, subproject_user_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.subproject_users.liveUnique({ where: { subproject_user_id } }),
    [subproject_user_id],
  )

  const addRow = useCallback(async () => {
    const subprojectUser = createSubprojectUser()
    await db.subproject_users.create({
      data: { ...subprojectUser, subproject_id },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/users/${subprojectUser.subproject_user_id}`,
    )
  }, [db.subproject_users, navigate, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.subproject_users.delete({
      where: {
        subproject_user_id,
      },
    })
    navigate(`/projects/${project_id}/subprojects/${subproject_id}/users`)
  }, [
    db.subproject_users,
    navigate,
    project_id,
    subproject_id,
    subproject_user_id,
  ])

  const row: SubprojectUser = results

  const userWhere = useMemo(() => ({ deleted: false }), [])

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.subproject_users.update({
        where: { subproject_user_id },
        data: { [name]: value },
      })
    },
    [db.subproject_users, subproject_user_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        tableName="subproject user"
      />
      <TextFieldInactive
        label="ID"
        name="subproject_user_id"
        value={row.subproject_user_id}
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
