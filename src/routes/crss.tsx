import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
// import { createCrs } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import '../form.css'

export const Component = memo(() => {
  // const navigate = useNavigate()
  // const [searchParams] = useSearchParams()
  const { project_id } = useParams()

  const { db } = useElectric()!

  const { results: crs = [] } = useLiveQuery(
    db.crs.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    console.log('TODO: fetch list, let user choose')
    // const data = await createCrs({ db, project_id })
    // await db.crs.create({ data })
    // navigate({ pathname: data.crs_id, search: searchParams.toString() })
  }, [])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`CRS: Coordinate Reference Systems (${crs.length})`}
        addRow={add}
        tableName="crs"
      />
      <div className="list-container">
        {crs.map(({ crs_id, label }) => (
          <Row key={crs_id} to={crs_id} label={label ?? crs_id} />
        ))}
      </div>
    </div>
  )
})
