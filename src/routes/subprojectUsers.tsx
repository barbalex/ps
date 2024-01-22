import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { SubprojectUser as SubprojectUser } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createSubprojectUser } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import '../form.css'
import { Row } from '../components/shared/Row'

export const Component = () => {
  const { subproject_id, project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.subproject_users.liveMany({
        where: { subproject_id, deleted: false },
        orderBy: { label: 'asc' },
      }),
    [subproject_id],
  )

  const add = useCallback(async () => {
    const subprojectUser = createSubprojectUser()
    await db.subproject_users.create({
      data: {
        ...subprojectUser,
        subproject_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/users/${subprojectUser.subproject_user_id}`,
    )
  }, [db.subproject_users, navigate, project_id, subproject_id])

  const subproject_users: SubprojectUser[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader
        title="Subproject Users"
        addRow={add}
        tableName="subproject user"
      />
      <div className="list-container">
        {subproject_users.map(({ subproject_user_id, label }) => (
          <Row
            key={subproject_user_id}
            to={`/projects/${project_id}/subprojects/${subproject_id}/users/${subproject_user_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
