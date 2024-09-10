import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSetAtom } from 'jotai'

import { createUser } from '../modules/createRows.ts'
import { useElectric } from '../ElectricProvider.tsx'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { userIdAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const setUserId = useSetAtom(userIdAtom)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: users = [] } = useLiveQuery(
    db.users.liveMany({ orderBy: { label: 'asc' } }),
  )

  const add = useCallback(async () => {
    const data = await createUser({ db, setUserId })

    navigate({ pathname: data.user_id, search: searchParams.toString() })
  }, [db, navigate, searchParams, setUserId])

  // console.log('hello users')

  return (
    <div className="list-view">
      <ListViewHeader
        title="Users"
        addRow={add}
        tableName="user"
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
