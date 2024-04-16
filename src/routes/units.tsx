import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createUnit } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!
  const { results: units = [] } = useLiveQuery(
    db.units.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const unit = createUnit()
    await db.units.create({
      data: {
        ...unit,
        project_id,
      },
    })
    navigate({ pathname: unit.unit_id, search: searchParams.toString() })
  }, [db.units, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader title="Units" addRow={add} tableName="unit" />
      <div className="list-container">
        {units.map(({ unit_id, label }) => (
          <Row key={unit_id} label={label ?? unit_id} to={unit_id} />
        ))}
      </div>
    </div>
  )
}
