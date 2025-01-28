import { useCallback, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createProjectUser } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()
  const { results: projectUsers = [] } = useLiveQuery(
    db.project_users.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const projectUser = createProjectUser()
    await db.project_users.create({
      data: {
        ...projectUser,
        project_id,
      },
    })
    navigate({
      pathname: projectUser.project_user_id,
      search: searchParams.toString(),
    })
  }, [db.project_users, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Project Users"
        addRow={add}
        tableName="project user"
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
