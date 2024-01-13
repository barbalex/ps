import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { SubprojectUser as SubprojectUser } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createSubprojectUser } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.subproject_users.liveMany({
        where: { subproject_id, deleted: false },
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
      {subproject_users.map(
        (subproject_user: SubprojectUser, index: number) => (
          <p key={index} className="item">
            <Link
              to={`/projects/${project_id}/subprojects/${subproject_id}/users/${subproject_user.subproject_user_id}`}
            >
              {subproject_user.label ?? subproject_user.subproject_user_id}
            </Link>
          </p>
        ),
      )}
    </div>
  )
}
