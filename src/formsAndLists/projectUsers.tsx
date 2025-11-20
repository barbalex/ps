import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createProjectUser } from '../modules/createRows.ts'
import { useProjectUsersNavData } from '../modules/useProjectUsersNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/projects/$projectId_/users/'

export const ProjectUsers = () => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useProjectUsersNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const res = await createProjectUser({ db, projectId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.project_user_id,
      params: (prev) => ({ ...prev, projectUserId: data.project_user_id }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map(({ id, label }) => (
              <Row
                key={id}
                to={id}
                label={label ?? id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
}
