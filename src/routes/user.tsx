import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { Button } from '@fluentui/react-components'

import { Users as User } from '../../../generated/client'
import { user as createUserPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'

import '../form.css'

export const Component = () => {
  const { user_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.users.liveUnique({ where: { user_id } }),
    [user_id],
  )

  const addRow = async () => {
    const newUser = createUserPreset()
    await db.users.create({
      data: newUser,
    })
    navigate(`/users/${newUser.user_id}`)
  }

  const deleteRow = async () => {
    await db.users.delete({
      where: {
        user_id,
      },
    })
    navigate(`/users`)
  }

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
      <div className="controls">
        <Button
          size="large"
          icon={<FaPlus />}
          onClick={addRow}
          title="Add new user"
        />
        <Button
          size="large"
          icon={<FaMinus />}
          onClick={deleteRow}
          title="Delete user"
        />
      </div>
      <TextFieldInactive label="ID" name="user_id" value={row.user_id} />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={row.email ?? ''}
        onChange={onChange}
      />
    </div>
  )
}
