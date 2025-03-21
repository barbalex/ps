import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createSubprojectUser } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/users/'

export const SubprojectUsers = memo(() => {
  const { subprojectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT subproject_user_id, label FROM subproject_users WHERE subproject_id = $1 ORDER BY label`,
    [subprojectId],
    'subproject_user_id',
  )
  const isLoading = res === undefined
  const subprojectUsers = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createSubprojectUser({ subprojectId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ to: data.subproject_user_id })
  }, [db, navigate, subprojectId])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Subproject Users"
        nameSingular="Subproject User"
        tableName="subproject_users"
        isFiltered={false}
        countFiltered={subprojectUsers.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {subprojectUsers.map(({ subproject_user_id, label }) => (
              <Row
                key={subproject_user_id}
                to={subproject_user_id}
                label={label ?? subproject_user_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
