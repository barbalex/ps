import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createSubprojectUser } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { subproject_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const result = useLiveQuery(
    `SELECT * FROM subproject_users WHERE subproject_id = $1 ORDER BY label ASC`,
    [subproject_id],
  )
  const subprojectUsers = result?.rows ?? []

  const add = useCallback(async () => {
    const res = await createSubprojectUser({ subproject_id, db })
    const data = res?.rows?.[0]
    navigate({
      pathname: data.subproject_user_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, searchParams, subproject_id])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Subproject Users"
        nameSingular="Subproject User"
        tableName="subproject_users"
        isFiltered={false}
        countFiltered={subprojectUsers.length}
        addRow={add}
      />
      <div className="list-container">
        {subprojectUsers.map(({ subproject_user_id, label }) => (
          <Row
            key={subproject_user_id}
            to={subproject_user_id}
            label={label ?? subproject_user_id}
          />
        ))}
      </div>
    </div>
  )
})
