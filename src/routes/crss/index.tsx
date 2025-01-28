import { useCallback, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createCrs } from '../../modules/createRows.ts'
import { ListViewHeader } from '../../components/ListViewHeader/index.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Info } from './Info.tsx'
import '../../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const { results: crs = [] } = useLiveQuery(
    db.crs.liveMany({ orderBy: { label: 'asc' } }),
  )

  const add = useCallback(async () => {
    const data = await createCrs()
    await db.crs.create({ data })
    navigate({ pathname: data.crs_id, search: searchParams.toString() })
  }, [db.crs, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`CRS: Coordinate Reference Systems (${crs.length})`}
        addRow={add}
        tableName="crs"
        info={<Info />}
      />
      <div className="list-container">
        {crs.map((cr) => (
          <Row key={cr.crs_id} to={cr.crs_id} label={cr.label ?? cr.crs_id} />
        ))}
      </div>
    </div>
  )
})
