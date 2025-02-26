import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createProjectUser } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const result = useLiveQuery(
    `SELECT * FROM project_users WHERE project_id = $1 ORDER BY label ASC`,
    [project_id],
  )
  const projectUsers = result?.rows ?? []

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
        addRow={add}
      />
      <div className="list-container">
        {projectUsers.map(({ project_user_id, label }) => (
          <Row
            key={project_user_id}
            to={project_user_id}
            label={label ?? project_user_id}
          />
        ))}
      </div>
    </div>
  )
})
