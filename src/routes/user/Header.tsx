import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createUser } from '../../modules/createRows.ts'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { user_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createUser({ db })

    navigate({
      pathname: `../${data.user_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.users.delete({
      where: { user_id },
    })
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [db.users, navigate, user_id, searchParams])

  const toNext = useCallback(async () => {
    const users = await db.users.findMany({
      orderBy: { label: 'asc' },
    })
    const len = users.length
    const index = users.findIndex((p) => p.user_id === user_id)
    const next = users[(index + 1) % len]
    navigate({
      pathname: `../${next.user_id}`,
      search: searchParams.toString(),
    })
  }, [db.users, navigate, user_id, searchParams])

  const toPrevious = useCallback(async () => {
    const users = await db.users.findMany({
      orderBy: { label: 'asc' },
    })
    const len = users.length
    const index = users.findIndex((p) => p.user_id === user_id)
    const previous = users[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.user_id}`,
      search: searchParams.toString(),
    })
  }, [db.users, navigate, user_id, searchParams])

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
