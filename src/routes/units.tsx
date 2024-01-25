import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Units as Unit } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createUnit } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.units.liveMany({
      where: { project_id, deleted: false },
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
    navigate(`/projects/${project_id}/units/${unit.unit_id}`)
  }, [db.units, navigate, project_id])

  const units: Unit[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader title="Units" addRow={add} tableName="unit" />
      <div className="list-container">
        {units.map(({ unit_id, label }) => (
          <Row
            key={unit_id}
            label={label}
            to={`/projects/${project_id}/units/${unit_id}`}
          />
        ))}
      </div>
    </div>
  )
}
