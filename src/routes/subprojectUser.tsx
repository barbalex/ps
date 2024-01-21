import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { SubprojectUsers as SubprojectUser } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createSubprojectUser } from '../modules/createRows'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DropdownField } from '../components/shared/DropdownField'
import { RadioGroupField } from '../components/shared/RadioGroupField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, subproject_user_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.subproject_users.liveUnique({ where: { subproject_user_id } }),
    [subproject_user_id],
  )

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/users`

  const addRow = useCallback(async () => {
    const subprojectUser = createSubprojectUser()
    await db.subproject_users.create({
      data: { ...subprojectUser, subproject_id },
    })
    navigate(`${baseUrl}/${subprojectUser.subproject_user_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db.subproject_users, navigate, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.subproject_users.delete({
      where: {
        subproject_user_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, db.subproject_users, navigate, subproject_user_id])

  const toNext = useCallback(async () => {
    const subprojectUsers = await db.subproject_users.findMany({
      where: { deleted: false, subproject_id },
      orderBy: { label: 'asc' },
    })
    const len = subprojectUsers.length
    const index = subprojectUsers.findIndex(
      (p) => p.subproject_user_id === subproject_user_id,
    )
    const next = subprojectUsers[(index + 1) % len]
    navigate(`${baseUrl}/${next.subproject_user_id}`)
  }, [
    baseUrl,
    db.subproject_users,
    navigate,
    subproject_id,
    subproject_user_id,
  ])

  const toPrevious = useCallback(async () => {
    const subprojectUsers = await db.subproject_users.findMany({
      where: { deleted: false, subproject_id },
      orderBy: { label: 'asc' },
    })
    const len = subprojectUsers.length
    const index = subprojectUsers.findIndex(
      (p) => p.subproject_user_id === subproject_user_id,
    )
    const previous = subprojectUsers[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.subproject_user_id}`)
  }, [
    baseUrl,
    db.subproject_users,
    navigate,
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
    <div className="form-outer-container">
      <FormHeader
        title="Subproject User"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="subproject user"
      />
      <div className="form-container">
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
          ref={autoFocusRef}
        />
        <RadioGroupField
          label="Role"
          name="role"
          list={['reader', 'editor', 'manager']}
          value={row.role ?? ''}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
