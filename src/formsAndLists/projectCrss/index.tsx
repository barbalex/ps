import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createProjectCrs } from '../../modules/createRows.ts'
import { ListViewHeader } from '../../components/ListViewHeader.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { Info } from './Info.tsx'
import '../../form.css'

const from = '/data/_authLayout/projects/$projectId_/crs/'

export const ProjectCrss = memo(() => {
  const navigate = useNavigate()
  const { projectId } = useParams({ from })

  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT * FROM project_crs WHERE project_id = $1 ORDER BY label`,
    [projectId],
    'project_crs_id',
  )
  const isLoading = res === undefined
  const projectCrs = res?.rows ?? []

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
      <ListViewHeader
        namePlural="CRS: Coordinate Reference Systems"
        nameSingular="CRS"
        tableName="project_crs"
        addRow={add}
        isFiltered={false}
        countFiltered={projectCrs.length}
        isLoading={isLoading}
        info={<Info />}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {projectCrs.map((cr) => (
              <Row
                key={cr.project_crs_id}
                to={cr.project_crs_id}
                label={cr.label ?? cr.project_crs_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
