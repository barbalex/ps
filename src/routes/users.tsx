import { useCallback, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createUser } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { userIdAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const setUserId = useSetAtom(userIdAtom)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const result = useLiveQuery(`SELECT * FROM users order by label asc`)
  const users = result?.rows ?? []

  const add = useCallback(async () => {
    const data = await createUser({ db, setUserId })
    const columns = Object.keys(data).join(',')
    const values = Object.values(data)
    const sql = `insert into users (${columns}) values (${values
      .map((_, i) => `$${i + 1}`)
      .join(',')})`
    await db.query(sql, values)
    navigate({ pathname: data.user_id, search: searchParams.toString() })
  }, [db, navigate, searchParams, setUserId])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Users"
        nameSingular="User"
        tableName="users"
        isFiltered={false}
        countFiltered={users.length}
        addRow={add}
      />
      <div className="list-container">
        {users.map(({ user_id, label }) => (
          <Row
            key={user_id}
            label={label ?? user_id}
            to={user_id}
          />
        ))}
      </div>
    </div>
  )
})
