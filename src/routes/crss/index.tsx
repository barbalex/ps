import { useCallback, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createCrs } from '../../modules/createRows.ts'
import { ListViewHeader } from '../../components/ListViewHeader/index.tsx'
import { Row } from '../../components/shared/Row.tsx'
import { Info } from './Info.tsx'
import '../../form.css'

export const Component = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const result = useLiveQuery(`SELECT * FROM crs order by label asc`)
  const crs = result?.rows ?? []

  const add = useCallback(async () => {
    const data = await createCrs()
    const columns = Object.keys(data).join(',')
    const values = Object.values(data)
    const sql = `INSERT INTO crs (${columns}) VALUES (${values
      .map((_, i) => `$${i + 1}`)
      .join(',')})`
    await db.query(sql, values)
    navigate({ pathname: data.crs_id, search: searchParams.toString() })
  }, [db, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="CRS: Coordinate Reference Systems"
        nameSingular="crs"
        tableName="crs"
        isFiltered={false}
        countFiltered={crs.length}
        addRow={add}
        info={<Info />}
      />
      <div className="list-container">
        {crs.map((cr) => (
          <Row
            key={cr.crs_id}
            to={cr.crs_id}
            label={cr.label ?? cr.crs_id}
          />
        ))}
      </div>
    </div>
  )
})
