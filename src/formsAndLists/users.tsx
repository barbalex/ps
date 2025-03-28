import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { createUser } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useUsersNavData } from '../modules/useUsersNavData.ts'
import { userIdAtom } from '../store.ts'

import '../form.css'

const from = 'data/_authLayout/users'

export const Users = memo(() => {
  const setUserId = useSetAtom(userIdAtom)
  const navigate = useNavigate({ from })
  const db = usePGlite()

  const { loading, navData } = useUsersNavData()
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createUser({ db, setUserId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ to: data.user_id })
  }, [db, navigate, setUserId])

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map(({ user_id, label }) => (
              <Row
                key={user_id}
                label={label ?? user_id}
                to={user_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
