import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createProjectUser } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT project_user_id, label FROM project_users WHERE project_id = $1 ORDER BY label`,
    [project_id],
    'project_user_id',
  )
  const isLoading = res === undefined
  const projectUsers = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createProjectUser({ db, project_id })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      pathname: data.project_user_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Project Users"
        nameSingular="project user"
        tableName="project_users"
        isFiltered={false}
        countFiltered={projectUsers.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {projectUsers.map(({ project_user_id, label }) => (
              <Row
                key={project_user_id}
                to={project_user_id}
                label={label ?? project_user_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
