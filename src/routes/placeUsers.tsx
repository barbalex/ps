import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createPlaceUser } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { place_id, place_id2 } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const result = useLiveQuery(
    `SELECT * FROM place_users WHERE place_id = $1 ORDER BY label ASC`,
    [place_id2 ?? place_id],
  )
  const placeUsers = result?.rows ?? []

  const add = useCallback(async () => {
    const data = { ...createPlaceUser(), place_id: place_id2 ?? place_id }
    const columns = Object.keys(data).join(',')
    const values = Object.values(data)
    const sql = `INSERT INTO place_users (${columns}) VALUES (${values
      .map((_, i) => `$${i + 1}`)
      .join(',')})`
    await db.query(sql, values)
    navigate({
      pathname: data.place_user_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, place_id, place_id2, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Users"
        nameSingular="user"
        tableName="users"
        isFiltered={false}
        countFiltered={placeUsers.length}
        addRow={add}
      />
      <div className="list-container">
        {placeUsers.map(({ place_user_id, label }) => (
          <Row
            key={place_user_id}
            to={place_user_id}
            label={label ?? place_user_id}
          />
        ))}
      </div>
    </div>
  )
})
