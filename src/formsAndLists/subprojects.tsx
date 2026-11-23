import { useParams, useNavigate } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { createSubproject } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useSubprojectsNavData } from '../modules/useSubprojectsNavData.ts'
import { userIdAtom } from '../store.ts'
import '../form.css'


export const Subprojects = () => {
  const { projectId } = useParams({ strict: false })
  const navigate = useNavigate()
  const userId = useAtomValue(userIdAtom)

  const { loading, navData, isFiltered } = useSubprojectsNavData({projectId: projectId! })
  const { navs: navsIn, label, nameSingular } = navData
  const navs = navsIn as { id: string; label: string | null }[]

  // only designers and owners may create subprojects — the backend's
  // enforce_subprojects_write enforces the same rule server-side
  const mayCreateResult = useLiveQuery(
    `
      SELECT 1 AS may
      FROM project_roles pr
      JOIN project_users pu ON pu.project_user_id = pr.project_user_id
      WHERE pr.project_id = $1
        AND pr.role IN ('design', 'own')
        AND (pu.auth_user_id = $2 OR pu.email = (SELECT email FROM users WHERE user_id = $2))
      LIMIT 1
    `,
    [projectId, userId],
  )
  const userMayCreate = Boolean(mayCreateResult?.rows?.length)

  const add = async () => {
    const subprojectId = await createSubproject({projectId: projectId! })
    if (!subprojectId) return
    navigate({
      to: `${subprojectId}/subproject`,
      params: (prev) => ({ ...prev, subprojectId }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={userMayCreate ? add : undefined}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              label={label ?? id}
              to={`/data/projects/${projectId}/subprojects/${id}`}
            />
          ))
        }
      </div>
    </div>
  )
}
