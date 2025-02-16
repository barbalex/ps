import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createProjectCrs } from '../../modules/createRows.ts'
import { ListViewHeader } from '../../components/ListViewHeader/index.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Info } from './Info.tsx'
import '../../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { project_id } = useParams()

  const db = usePGlite()

  const { rows: projectCrs = [] } = useLiveQuery(
    `SELECT * FROM project_crs WHERE project_id = $1 ORDER BY label ASC`,
    [project_id],
  )

  const add = useCallback(async () => {
    const res = await createProjectCrs({ project_id, db })
    const projectCrs = res.rows[0]
    navigate({
      pathname: projectCrs.project_crs_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`CRS: Coordinate Reference Systems (${projectCrs.length})`}
        addRow={add}
        tableName="project_crs"
        info={<Info />}
      />
      <div className="list-container">
        {projectCrs.map((cr) => (
          <Row
            key={cr.project_crs_id}
            to={cr.project_crs_id}
            label={cr.label ?? cr.project_crs_id}
          />
        ))}
      </div>
    </div>
  )
})
