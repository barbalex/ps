import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createProjectUser } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: projectUsers = [] } = useLiveQuery(
    db.project_users.liveMany({
      where: { project_id, deleted: false },
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
          <Row key={project_user_id} to={project_user_id} label={label} />
        ))}
      </div>
    </div>
  )
}
