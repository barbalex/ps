import { useCallback, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useSetAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createUser } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { userIdAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const setUserId = useSetAtom(userIdAtom)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT user_id, label FROM users ORDER BY label`,
    undefined,
    'user_id',
  )
  const isLoading = res === undefined
  const users = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createUser({ db, setUserId })
    const data = res?.rows?.[0]
    if (!data) return
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
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {users.map(({ user_id, label }) => (
              <Row
                key={user_id}
                label={label ?? user_id}
                to={user_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
