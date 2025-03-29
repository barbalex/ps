import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubprojectUser } from '../modules/createRows.ts'
import { useSubprojectUsersNavData } from '../modules/useSubprojectUsersNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/users/'

export const SubprojectUsers = memo(() => {
  const { projectId, subprojectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useSubprojectUsersNavData({
    projectId,
    subprojectId,
  })
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createSubprojectUser({ subprojectId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({ to: data.subproject_user_id })
  }, [db, navigate, subprojectId])

  return (
    <div className="list-view">
      <ListHeader label={label} nameSingular={nameSingular} addRow={add} />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          <>
            {navs.map(({ subproject_user_id, label }) => (
              <Row
                key={subproject_user_id}
                to={subproject_user_id}
                label={label ?? subproject_user_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
