import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createUser } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { user_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = createUser()
    await db.users.create({ data })
    navigate(`/users/${data.user_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db.users, navigate])

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

  return (
    <FormHeader
      title="User"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="user"
    />
  )
})
