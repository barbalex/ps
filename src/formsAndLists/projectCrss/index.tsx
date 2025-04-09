import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createProjectCrs } from '../../modules/createRows.ts'
import { useProjectCrssNavData } from '../../modules/useProjectCrssNavData.ts'
import { ListHeader } from '../../components/ListHeader.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Info } from './Info.tsx'
import '../../form.css'

const from = '/data/_authLayout/projects/$projectId_/crs/'

export const ProjectCrss = memo(() => {
  const navigate = useNavigate()
  const { projectId } = useParams({ from })

  const db = usePGlite()

  const { loading, navData } = useProjectCrssNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createProjectCrs({ projectId, db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.project_crs_id,
      params: (prev) => ({ ...prev, projectCrsId: data.project_crs_id }),
    })
  }, [db, navigate, projectId])

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        info={<Info />}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map((nav) => (
              <Row
                key={nav.id}
                to={nav.id}
                label={nav.label ?? nav.id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
