import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createPlaceUser } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = 'TODO:'

export const Component = memo(() => {
  const { placeId, placeId2 } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT place_user_id, label FROM place_users WHERE place_id = $1 ORDER BY label`,
    [placeId2 ?? placeId],
    'place_user_id',
  )
  const isLoading = res === undefined
  const placeUsers = res?.rows ?? []

  const add = useCallback(async () => {
    const res = createPlaceUser({ placeId: placeId2 ?? placeId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.place_user_id,
      params: (prev) => ({ ...prev, placeUserId: data.place_user_id }),
    })
  }, [db, navigate, placeId, placeId2])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Users"
        nameSingular="user"
        tableName="users"
        isFiltered={false}
        countFiltered={placeUsers.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {placeUsers.map(({ place_user_id, label }) => (
              <Row
                key={place_user_id}
                to={place_user_id}
                label={label ?? place_user_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
