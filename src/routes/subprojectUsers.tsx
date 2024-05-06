import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createSubprojectUser } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import '../form.css'
import { Row } from '../components/shared/Row.tsx'

export const Component = () => {
  const { subproject_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: subprojectUsers = [] } = useLiveQuery(
    db.subproject_users.liveMany({
      where: { subproject_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const subprojectUser = createSubprojectUser()
    await db.subproject_users.create({
      data: {
        ...subprojectUser,
        subproject_id,
      },
    })
    navigate({
      pathname: subprojectUser.subproject_user_id,
      search: searchParams.toString(),
    })
  }, [db.subproject_users, navigate, searchParams, subproject_id])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Subproject Users"
        addRow={add}
        tableName="subproject user"
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
}
