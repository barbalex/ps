import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Users as User } from '../../../generated/client'
import { createUser } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { user_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.users.liveUnique({ where: { user_id } }),
    [user_id],
  )

  const addRow = useCallback(async () => {
    const data = createUser()
    await db.users.create({ data })
    navigate(`/users/${data.user_id}`)
    autoFocusRef.current?.focus()
  }, [db.users, navigate])

  const deleteRow = useCallback(async () => {
    await db.users.delete({
      where: { user_id },
    })
    navigate(`/users`)
  }, [db.users, navigate, user_id])

  const toNext = useCallback(async () => {
    const users = await db.users.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = users.length
    const index = users.findIndex((p) => p.user_id === user_id)
    const next = users[(index + 1) % len]
    navigate(`/users/${next.user_id}`)
  }, [db.users, navigate, user_id])

  const toPrevious = useCallback(async () => {
    const users = await db.users.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = users.length
    const index = users.findIndex((p) => p.user_id === user_id)
    const previous = users[(index + len - 1) % len]
    navigate(`/users/${previous.user_id}`)
  }, [db.users, navigate, user_id])

  const row: User = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.users.update({
        where: { user_id },
        data: { [name]: value },
      })
    },
    [db.users, user_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="user"
      />
      <TextFieldInactive label="ID" name="user_id" value={row.user_id} />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={row.email ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
      />
    </div>
  )
}
